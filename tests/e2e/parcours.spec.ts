import { test, expect, type Page } from "@playwright/test";
import { db, ADMIN_PASSWORD, SCHOOL, proof } from "./helpers";

async function participate(page: Page, labels: string[], text?: string) {
  await page.goto(`/lycee/${SCHOOL}/participer`);
  for (const l of labels) await page.getByText(l, { exact: true }).click();
  if (text) {
    await page.getByRole("button", { name: "+ Écrire un signalement" }).click();
    await page.getByLabel("Ton signalement").fill(text);
  }
  await page.waitForTimeout(1600); // un humain met plus de 1,5 s
  await page.getByRole("button", { name: /^Envoyer/ }).click();
}

test("accueil : message clair, aucun chiffre inventé", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Et si ton lycée ou ta fac pouvait enfin");
  await expect(page.getByText("Signale ce qui ne fonctionne pas")).toBeVisible();
  await expect(page.getByRole("link", { name: "Trouver mon établissement" })).toBeVisible();
  await expect(page.getByText("Les premiers résultats s'afficheront ici.")).toBeVisible();
});

test("recherche : autocomplétion, homonymes, fautes de frappe, code postal", async ({ page }) => {
  await page.goto("/recherche");
  const box = page.getByRole("combobox");
  await box.fill("victor hugo");
  const options = page.getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(options.nth(0)).toContainText(/Autreville|Villefictive/);
  await box.fill("viktor hugi");
  await expect(page.getByText("Résultats approchants")).toBeVisible();
  await expect(page.getByRole("option").first()).toBeVisible();
  await box.fill("99300");
  await expect(page.getByRole("option")).toHaveCount(1);
  await box.fill("zzzzzz");
  await expect(page.getByText(/Aucun établissement trouvé/)).toBeVisible();
  await box.fill("villefictive curie");
  await page.getByRole("option").first().click();
  await expect(page).toHaveURL(/\/lycee\/9990003C$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marie-Curie");
});

test("universités : recherche, page et vocabulaire adaptés", async ({ page }) => {
  await page.goto("/recherche");
  await page.getByRole("combobox").fill("universite villefictive");
  const opt = page.getByRole("option").first();
  await expect(opt).toContainText("Université Fictive de Villefictive");
  await opt.click();
  await expect(page).toHaveURL(/\/lycee\/9990101U$/);
  await expect(page.getByText("Université · Villefictive")).toBeVisible();
  await expect(page.getByRole("link", { name: "Faire entendre mon université" })).toBeVisible();
  await expect(page.getByText("Amphis et TD surchargés")).toBeVisible();
  await expect(page.getByText("Non représentatif de tous les étudiants")).toBeVisible();
});

test("écoles du supérieur : recherche et page", async ({ page }) => {
  await page.goto("/recherche");
  await page.getByRole("combobox").fill("ecole fictive ingenieurs");
  const opt = page.getByRole("option").first();
  await expect(opt).toContainText("École Fictive d'Ingénieurs");
  await opt.click();
  await expect(page.getByText("École · Villefictive")).toBeVisible();
  await expect(page.getByRole("link", { name: "Faire entendre mon école" })).toBeVisible();
});

test("participation complète, texte protégé, doublon bloqué", async ({ page }) => {
  await page.goto(`/lycee/${SCHOOL}`);
  await expect(page.getByText("Non représentatif de tous les élèves")).toBeVisible();
  await expect(page.getByText(/participation comptabilisée/)).toBeVisible();

  // Un numéro de téléphone dans le texte est bloqué
  await participate(page, ["Professeurs absents", "État des bâtiments"], "Appelle moi au 06 12 34 56 78 pour en parler");
  await expect(page.locator("p[role=alert]")).toContainText("numéro de téléphone");

  await page.getByLabel("Ton signalement").fill("Les toilettes du bâtiment B sont fermées depuis la rentrée.");
  await page.getByRole("button", { name: /^Envoyer/ }).click();
  await expect(page).toHaveURL(/merci=1/);
  await expect(page.getByText("Merci, ta voix est comptée.")).toBeVisible();
  await expect(page.getByText("relu par l'équipe")).toBeVisible();
  // le texte n'est pas publié
  await expect(page.getByText("toilettes du bâtiment B")).toHaveCount(0);
  await expect(page.getByTestId("total")).toHaveText("1");

  // Même navigateur : toujours une seule participation
  await participate(page, ["Classes surchargées"]);
  await expect(page).toHaveURL(/merci=1/);
  const sql = db();
  const rows = await sql`select categories, status from participations where school_uai = ${SCHOOL}`;
  await sql.end();
  expect(rows).toHaveLength(1);
  expect(rows[0].categories.sort()).toEqual(["batiments", "classes_surchargees", "profs_absents"]);
  expect(rows[0].status).toBe("counted");
});

test("soutien en un geste depuis un autre navigateur", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(`/lycee/${SCHOOL}`);
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Je soutiens : État des bâtiments" }).click();
  await expect(page).toHaveURL(/merci=1/);
  await expect(page.getByTestId("total")).toHaveText("2");
  await expect(page.getByText("Tu soutiens").first()).toBeVisible();
  await ctx.close();
});

test("robot (champ piège) : suspendu et non compté", async ({ request, baseURL }) => {
  const res = await request.post("/api/participations", {
    headers: { origin: baseURL! },
    data: { uai: SCHOOL, categories: ["autre"], hp: "http://spam", elapsed: 50, pow: await proof(request, SCHOOL) },
  });
  expect(res.ok()).toBeTruthy();
  const sql = db();
  const [r] = await sql`select status, flags from participations where 'piege' = any(flags)`;
  await sql.end();
  expect(r.status).toBe("suspended");
  expect(r.flags).toContain("trop_rapide");
});

test("triche : nouveaux navigateurs en série depuis la même connexion mis en vérification", async ({ browser }) => {
  // 3 navigateurs ont déjà participé depuis cette connexion : le 4e n'est pas compté tout de suite.
  const ctx = await browser.newContext({ locale: "fr-FR" });
  const page = await ctx.newPage();
  await page.goto(`/lycee/${SCHOOL}`);
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Je soutiens : Orientation et Parcoursup" }).click();
  await expect(page).toHaveURL(/verif=1/);
  await expect(page.getByText("Merci, ta voix est enregistrée.")).toBeVisible();
  await expect(page.getByTestId("total")).toHaveText("2");
  await expect(page.getByText("+ 1 en cours de vérification")).toBeVisible();
  await ctx.close();
});

test("anti-robot : preuve de travail obligatoire, non rejouable, liée au lycée", async ({ request, baseURL }) => {
  const headers = { origin: baseURL! };
  const base = { uai: SCHOOL, categories: ["autre"], elapsed: 5000 };
  expect((await request.post("/api/participations", { headers, data: base })).status()).toBe(400);
  const p = await proof(request, SCHOOL);
  expect((await request.post("/api/participations", { headers, data: { ...base, pow: { ...p, n: "0" } } })).status()).toBe(400);
  const other = await proof(request, "9990003C");
  expect((await request.post("/api/participations", { headers, data: { ...base, pow: other } })).status()).toBe(400);
  expect((await request.post("/api/participations", { headers, data: { ...base, pow: p } })).status()).toBe(200);
  expect((await request.post("/api/participations", { headers, data: { ...base, pow: p } })).status()).toBe(400);
});

test("sécurité API : origine étrangère refusée, entrée invalide rejetée, lycée inconnu", async ({ request, baseURL }) => {
  expect((await request.post("/api/participations", { headers: { origin: "https://evil.example" }, data: { uai: SCHOOL, categories: ["autre"] } })).status()).toBe(403);
  expect((await request.post("/api/participations", { headers: { origin: baseURL! }, data: { uai: "'; drop table schools; --", categories: ["autre"] } })).status()).toBe(400);
  expect((await request.post("/api/participations", { headers: { origin: baseURL! }, data: { uai: SCHOOL, categories: ["inexistante"] } })).status()).toBe(400);
  expect((await request.post("/api/participations", { headers: { origin: baseURL! }, data: { uai: "0000000Z", categories: ["autre"], pow: await proof(request, "0000000Z") } })).status()).toBe(404);
  const s = await request.get("/api/schools/search?q=%27%20or%201%3D1%20--");
  expect(s.ok()).toBeTruthy();
});

test("administration protégée et modération", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/connexion/);
  await page.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("incorrect");
  await page.getByLabel("Mot de passe").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("Participations comptées")).toBeVisible();

  await page.goto("/admin/moderation");
  await expect(page.getByText("Les toilettes du bâtiment B")).toBeVisible();
  await page.getByRole("button", { name: "Publier" }).first().click();
  await expect(page.getByText("Rien à traiter.")).toBeVisible();

  await page.goto(`/lycee/${SCHOOL}?merci=1`);
  await expect(page.getByText("Témoignages relus")).toBeVisible();
  await expect(page.getByText("Les toilettes du bâtiment B")).toBeVisible();

  // Participation suspecte suspendue visible et actionnable
  await page.goto("/admin/participations");
  await expect(page.getByText("Champ piège rempli (robot)")).toBeVisible();
  await expect(page.getByText(/Plusieurs navigateurs sur la même connexion/).first()).toBeVisible();
  // Après contrôle, l'équipe valide le groupe : les voix en vérification sont comptées.
  await page.getByRole("button", { name: "Valider le groupe" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto(`/lycee/${SCHOOL}?merci=1`);
  await expect(page.getByTestId("total")).toHaveText("4");

  // État de traitement
  await page.goto(`/admin/lycees?q=fictif&uai=${SCHOOL}`);
  const form = page.locator("form", { hasText: "État des bâtiments" });
  await form.locator("select").selectOption("transmis");
  await form.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto(`/lycee/${SCHOOL}?merci=1`);
  await expect(page.getByText("Transmis à l'établissement")).toBeVisible();

  // Sans session : la page admin redirige, même via requête directe
  const r = await request.get("/admin/moderation", { maxRedirects: 0 });
  expect([302, 303, 307, 308, 200]).toContain(r.status());
  if (r.status() === 200) expect(await r.text()).not.toContain("toilettes");
});

test("mot de passe facultatif de l'établissement", async ({ page, browser }) => {
  const OTHER = "9990003C";
  // Sans mot de passe défini, le champ n'apparaît pas
  await page.goto(`/lycee/${OTHER}/participer`);
  await expect(page.getByLabel(/Mot de passe de ton établissement/)).toHaveCount(0);

  await page.goto("/admin/connexion");
  await page.getByLabel("Mot de passe").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/lycees?q=curie&uai=${OTHER}`);
  await page.getByLabel("Nouveau mot de passe").fill("Soleil cartable tempête");
  await page.getByRole("button", { name: "Définir" }).click();
  await expect(page.getByText(/Actif \(version 1/)).toBeVisible();
  const sql = db();
  const [c] = await sql`select code_hash from school_codes where school_uai = ${OTHER}`;
  expect(c.code_hash).not.toContain("soleil"); // jamais en clair

  const ctx = await browser.newContext({ locale: "fr-FR" });
  const p = await ctx.newPage();
  await p.goto(`/lycee/${OTHER}/participer`);
  await p.getByText("État des bâtiments", { exact: true }).click();
  await p.getByLabel(/Mot de passe de ton établissement/).fill("lune trousse orage");
  await p.waitForTimeout(1600);
  await p.getByRole("button", { name: /^Envoyer/ }).click();
  await expect(p.locator("p[role=alert]")).toContainText("ne correspond pas");
  // Majuscules, accents et espaces ne comptent pas
  await p.getByLabel(/Mot de passe de ton établissement/).fill("  SOLEIL  cartable  tempete ");
  await p.getByRole("button", { name: /^Envoyer/ }).click();
  await expect(p).toHaveURL(/code=1/);
  await expect(p.getByText("Mot de passe reconnu")).toBeVisible();
  await expect(p.getByText(/dont 1 confirmée avec le mot de passe/)).toBeVisible();
  const [r] = await sql`select with_code from participations where school_uai = ${OTHER}`;
  expect(r.with_code).toBe(true);
  await sql.end();
  await ctx.close();
});

test("partage : lien unique, Open Graph et images", async ({ page, request }) => {
  await page.goto(`/lycee/${SCHOOL}`);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toContain(`/lycee/${SCHOOL}/og`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Fictif Victor-Hugo/);
  await expect(page.getByRole("button", { name: "Partager la page" })).toBeVisible();
  const img = await request.get(`/lycee/${SCHOOL}/og`);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
  const story = await request.get(`/lycee/${SCHOOL}/story`);
  expect(story.status()).toBe(200);
  expect((await request.get(`/lycee/0000000Z/og`)).status()).toBe(404);
});

test("tableau national et pages légales", async ({ page }) => {
  await page.goto("/tableau");
  await expect(page.getByRole("heading", { name: "Préoccupations citées" })).toBeVisible();
  await expect(page.getByText("Pas de classement des établissements", { exact: false })).toBeVisible();
  for (const p of ["/a-propos", "/confidentialite", "/mentions-legales", "/charte"]) {
    const r = await page.goto(p);
    expect(r?.status()).toBe(200);
  }
  await page.goto("/mentions-legales");
  await expect(page.locator(".todo").first()).toBeVisible();
});

test("signalement d'abus et demande de suppression", async ({ page }) => {
  await page.goto(`/signaler?page=/lycee/${SCHOOL}`);
  await page.getByText("Accusation contre une personne identifiable").click();
  await page.getByRole("button", { name: "Envoyer le signalement" }).click();
  await expect(page.getByText("Ton signalement va être examiné")).toBeVisible();
  await page.goto("/mes-donnees");
  await page.getByRole("textbox", { name: "Ta demande", exact: true }).fill("Merci de supprimer mon message.");
  await page.getByRole("button", { name: "Envoyer la demande" }).click();
  await expect(page.getByText("Demande reçue.")).toBeVisible();
  const sql = db();
  const [{ n }] = await sql`select count(*)::int as n from abuse_reports`;
  const [{ m }] = await sql`select count(*)::int as m from deletion_requests`;
  await sql.end();
  expect(n).toBe(1);
  expect(m).toBe(1);
});

test("effacement immédiat de mes participations", async ({ page }) => {
  await participate(page, ["Orientation et Parcoursup"]);
  await expect(page).toHaveURL(/merci=1/);
  await page.goto("/mes-donnees");
  await page.getByRole("button", { name: "Effacer mes participations" }).click();
  await page.getByRole("button", { name: "Oui, tout effacer" }).click();
  await expect(page.getByText(/1 participation effacée/)).toBeVisible();
});

test("en-têtes de sécurité", async ({ request }) => {
  const r = await request.get("/");
  const h = r.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toBeTruthy();
  expect(h["x-powered-by"]).toBeUndefined();
});
