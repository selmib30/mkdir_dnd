import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const utilisateur = sqliteTable('utilisateur', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pseudo: text('pseudo').notNull().unique(),
  email: text('email').notNull().unique(),
  motDePasse: text('mot_de_passe').notNull(),
});

export const classe = sqliteTable('classe', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nom: text('nom').notNull().unique(),
  sousClasse: text('sous_classe'),
  description: text('description'),
});

export const objet = sqliteTable('objet', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nom: text('nom').notNull(),
  type: text('type'),
  description: text('description'),
});

export const personnage = sqliteTable('personnage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  niveau: integer('niveau').notNull().default(1),
  pv: integer('pv').notNull(),
  ca: integer('ca').notNull(),
  race: text('race').notNull(),
  favori: integer('favori', { mode: 'boolean' }).notNull().default(false),
  classeId: integer('classe_id').notNull().references(() => classe.id),
  utilisateurId: integer('utilisateur_id').notNull()
    .references(() => utilisateur.id, { onDelete: 'cascade' }),
});

export const sort = sqliteTable('sort', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nom: text('nom').notNull(),
  niveau: integer('niveau').notNull(),
  description: text('description'),
  classeId: integer('classe_id').references(() => classe.id),
});

export const personnageSort = sqliteTable('personnage_sort', {
  personnageId: integer('personnage_id').notNull()
    .references(() => personnage.id, { onDelete: 'cascade' }),
  sortId: integer('sort_id').notNull()
    .references(() => sort.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.personnageId, t.sortId] })]);

export const personnageObjet = sqliteTable('personnage_objet', {
  personnageId: integer('personnage_id').notNull()
    .references(() => personnage.id, { onDelete: 'cascade' }),
  objetId: integer('objet_id').notNull()
    .references(() => objet.id, { onDelete: 'cascade' }),
  quantite: integer('quantite').notNull().default(1),
}, (t) => [primaryKey({ columns: [t.personnageId, t.objetId] })]);