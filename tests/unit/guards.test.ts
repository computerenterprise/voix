import { test } from "node:test";
import assert from "node:assert/strict";
import { checkText } from "../../src/lib/text-guard";
import { normalize, queryTokens } from "../../src/lib/normalize";
import { parseCsv } from "../../scripts/csv";

test("bloque les coordonnées personnelles", () => {
  assert.deepEqual(checkText("écris moi à jean.dupont@gmail.com").blocking, ["email"]);
  assert.ok(checkText("mon num 06 12 34 56 78").blocking.includes("telephone"));
  assert.ok(checkText("+33 6 12 34 56 78 appelle").blocking.includes("telephone"));
  assert.ok(checkText("va voir www.exemple.fr").blocking.includes("lien"));
  assert.ok(checkText("suivez @lycee_revolte").blocking.includes("pseudo_reseau"));
  assert.ok(checkText("il habite 12 rue des Lilas").blocking.includes("adresse"));
});

test("laisse passer un constat normal", () => {
  const r = checkText("Les toilettes du bâtiment B sont fermées depuis la rentrée, 3 classes de 36 élèves.");
  assert.deepEqual(r.blocking, []);
  assert.deepEqual(r.flags, []);
});

test("signale les risques pour la modération", () => {
  assert.ok(checkText("Madame Martin est nulle").flags.includes("personne_nommee"));
  assert.ok(checkText("le prof Durand ne vient jamais").flags.includes("personne_nommee"));
  assert.ok(checkText("je vais le frapper").flags.includes("menace"));
  assert.ok(checkText("ce connard de surveillant").flags.includes("insulte"));
  assert.ok(checkText("blocus demain 7h").flags.includes("mobilisation"));
});

test("normalisation et jetons de recherche", () => {
  assert.equal(normalize("Lycée Saint-Étienne d'Œuf"), "lycee saint etienne d oeuf");
  assert.deepEqual(queryTokens("Lycée général Victor-Hugo"), ["victor", "hugo"]);
  assert.deepEqual(queryTokens("lycée"), ["lycee"]);
  assert.deepEqual(queryTokens("Henri 4"), ["henri", "iv"]);
});

test("CSV : guillemets, séparateurs et BOM", () => {
  const rows = parseCsv('﻿a;b\n"x;1";"il dit ""oui"""\r\n', ";");
  assert.deepEqual(rows, [["a", "b"], ["x;1", 'il dit "oui"']]);
});
