"use strict";

const Bluebird = require("bluebird");
const { TextMessage } = require("../../../platforms/generics");

const questions = [
  "Pourrais tu nous dire combien fait la multiplication de ces 3 chiffres. Le nombre de datacenters chez OVH, le nombre de pays dans lesquels nous sommes implantés et l'âge de la société OVH ?",
  "Quel est le code de la couleur du logo de OVH ?",
  "Ou se situe le siege social de OVH ?",
  "Quel est le produit du nombre de langue disponibles sur le site ovh.com et de la fréquence maximale de nos CPU dans nos serveurs dédiés ?",
  "Que veux dire OVH ?",
  "Quelle est ma version ? Petit indice: je suis open source",
  "Qui est mon créateur original ?",
  "Combien de partenaires technique OVH a ?",
  "Combien de temps faut il pour lire l'article sur moi ? Petit indice: l'article se trouve sur le blog de OVH",
  "Combien y a t'il de questions en tout ? :p"
];

const base = "Salut à toi 👋, tu as soif ? 🍺 Il faut la mériter si tu en veux. ";

class NdhQuestion {
  static action() {
    return Bluebird.resolve({ responses: [new TextMessage( base + questions[ Math.floor(Math.random() * questions.length) ])], feedback: false });
  }
}

module.exports = {ndh_Question: NdhQuestion};
