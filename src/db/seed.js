import bcrypt from 'bcryptjs';
import {
  db, utilisateur, classe, objet, sort,
  personnage, personnageSort, personnageObjet,
} from './index.js';

// 1. Vider les tables (liaisons d'abord, pour respecter les clés étrangères)
await db.delete(personnageSort);
await db.delete(personnageObjet);
await db.delete(personnage);
await db.delete(sort);
await db.delete(objet);
await db.delete(classe);
await db.delete(utilisateur);

// 2. Utilisateur de test
const [user] = await db.insert(utilisateur).values({
  pseudo: 'testeur',
  email: 'testeur@example.com',
  motDePasse: await bcrypt.hash('motdepasse123', 10),
}).returning();

// 3. Classes
const classes = await db.insert(classe).values([
  { nom: 'Guerrier', sousClasse: 'Champion', description: 'Combattant expert des armes et des armures.' },
  { nom: 'Magicien', sousClasse: "École d'évocation", description: 'Lanceur de sorts érudit qui puise dans ses grimoires.' },
  { nom: 'Clerc', sousClasse: 'Domaine de la vie', description: 'Serviteur divin capable de soigner et de protéger.' },
  { nom: 'Rôdeur', sousClasse: 'Chasseur', description: 'Pisteur et archer à l\'aise en pleine nature.' },
  { nom: 'Roublard', sousClasse: 'Voleur', description: 'Spécialiste de la discrétion et des coups précis.' },
]).returning();
const C = Object.fromEntries(classes.map((c) => [c.nom, c.id]));

// 4. Sorts
const sorts = await db.insert(sort).values([
  { nom: 'Trait de feu', niveau: 0, classeId: C['Magicien'], description: 'Projette un trait de feu sur une cible à portée.' },
  { nom: 'Prestidigitation', niveau: 0, classeId: C['Magicien'], description: 'Petits tours de magie mineurs.' },
  { nom: 'Projectile magique', niveau: 1, classeId: C['Magicien'], description: 'Trois fléchettes de force qui touchent automatiquement.' },
  { nom: 'Bouclier', niveau: 1, classeId: C['Magicien'], description: 'Barrière invisible : +5 à la CA jusqu\'au prochain tour.' },
  { nom: 'Sommeil', niveau: 1, classeId: C['Magicien'], description: 'Endort des créatures dont le total de PV est faible.' },
  { nom: 'Détection de la magie', niveau: 1, classeId: C['Magicien'], description: 'Perçoit la présence de magie à proximité.' },
  { nom: 'Flamme sacrée', niveau: 0, classeId: C['Clerc'], description: 'Lumière divine qui descend sur une créature.' },
  { nom: 'Soins', niveau: 1, classeId: C['Clerc'], description: 'Rend des points de vie à une créature touchée.' },
  { nom: 'Bénédiction', niveau: 1, classeId: C['Clerc'], description: 'Bonus aux jets d\'attaque et de sauvegarde des alliés.' },
  { nom: 'Marque du chasseur', niveau: 1, classeId: C['Rôdeur'], description: 'Désigne une proie et inflige des dégâts supplémentaires.' },
]).returning();
const S = Object.fromEntries(sorts.map((s) => [s.nom, s.id]));

// 5. Objets
const objets = await db.insert(objet).values([
  { nom: 'Épée longue', type: 'arme', description: 'Arme de corps à corps polyvalente.' },
  { nom: 'Arc court', type: 'arme', description: 'Arme à distance légère.' },
  { nom: 'Dague', type: 'arme', description: 'Petite lame, légère et lançable.' },
  { nom: 'Bâton', type: 'arme', description: 'Bâton de bois à deux mains.' },
  { nom: 'Cotte de mailles', type: 'armure', description: 'Armure lourde (CA 16).' },
  { nom: 'Armure de cuir', type: 'armure', description: 'Armure légère (CA 11 + Dex).' },
  { nom: 'Bouclier', type: 'armure', description: 'Bonus de +2 à la CA.' },
  { nom: 'Potion de soins', type: 'consommable', description: 'Rend 2d4+2 points de vie.' },
  { nom: 'Focalisation arcanique', type: 'outil', description: 'Cristal pour lancer des sorts.' },
  { nom: "Sac d'aventurier", type: 'outil', description: 'Corde, torche, rations et gourde.' },
]).returning();
const O = Object.fromEntries(objets.map((o) => [o.nom, o.id]));

// 6. Personnages de niveau 1
const [thorgrim, elara, brother] = await db.insert(personnage).values([
  { nom: 'Poing-de-Fer', prenom: 'Thorgrim', niveau: 1, pv: 12, ca: 16, race: 'Nain',
    favori: true, classeId: C['Guerrier'], utilisateurId: user.id },
  { nom: 'Vent-Sylvestre', prenom: 'Elara', niveau: 1, pv: 7, ca: 12, race: 'Elfe',
    favori: true, classeId: C['Magicien'], utilisateurId: user.id },
  { nom: 'Lumière', prenom: 'Aldric', niveau: 1, pv: 10, ca: 16, race: 'Humain',
    favori: false, classeId: C['Clerc'], utilisateurId: user.id },
]).returning();

// 7. Liaisons personnage <-> sort
await db.insert(personnageSort).values([
  { personnageId: elara.id, sortId: S['Trait de feu'] },
  { personnageId: elara.id, sortId: S['Prestidigitation'] },
  { personnageId: elara.id, sortId: S['Projectile magique'] },
  { personnageId: elara.id, sortId: S['Bouclier'] },
  { personnageId: elara.id, sortId: S['Sommeil'] },
  { personnageId: brother.id, sortId: S['Flamme sacrée'] },
  { personnageId: brother.id, sortId: S['Soins'] },
  { personnageId: brother.id, sortId: S['Bénédiction'] },
]);

// 8. Liaisons personnage <-> objet
await db.insert(personnageObjet).values([
  { personnageId: thorgrim.id, objetId: O['Épée longue'] },
  { personnageId: thorgrim.id, objetId: O['Cotte de mailles'] },
  { personnageId: thorgrim.id, objetId: O['Bouclier'] },
  { personnageId: thorgrim.id, objetId: O['Sac d\'aventurier'] },
  { personnageId: elara.id, objetId: O['Bâton'] },
  { personnageId: elara.id, objetId: O['Focalisation arcanique'] },
  { personnageId: elara.id, objetId: O['Potion de soins'], quantite: 2 },
  { personnageId: brother.id, objetId: O['Cotte de mailles'] },
  { personnageId: brother.id, objetId: O['Bouclier'] },
  { personnageId: brother.id, objetId: O['Potion de soins'] },
]);

console.log('Seed terminé : 1 utilisateur, 5 classes, 10 sorts, 10 objets, 3 personnages.');
process.exit(0);