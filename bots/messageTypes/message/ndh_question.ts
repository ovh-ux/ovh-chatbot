"use strict";

import * as Bluebird from "bluebird";
import { TextMessage } from "../../../platforms/generics";

const questions = [
  "Pourrais-tu nous dire combien fait la multiplication de ces 3 chiffres. Le nombre de datacenters chez OVH, le nombre de pays dans lesquels nous sommes implantés et l'âge de la société OVH ?",
  "Quel est le code de la couleur du logo d'OVH ?",
  "Où se situe le siège social d'OVH ?",
  "Combien de langues sont disponibles sur le site ovh.com ?",
  "Que veut dire OVH ?",
  "Quelle est ma version ? Petit indice: je suis open source",
  "Combien j'ai de contributeurs (sur github)?",
  "Combien de partenaires techniques possède OVH ? indice: https://www.ovh.com/fr/apropos/partenaires-techniques.xml",
  "Combien de temps faut-il pour lire l'article sur mon développement ? Petit indice: l'article se trouve sur le blog d'OVH",
  "Combien de questions différentes je possède ? Petit indice: je suis open source 🤗"
];
const base = "Salut à toi 👋, tu as soif ? 🍺 Il faut la mériter si tu en veux. ";

class NdhQuestion {
  static action (senderId?, message?, entities?, res?): Promise<any> {
    return Bluebird.resolve({ responses: [new TextMessage(base + questions[Math.floor(Math.random() * questions.length)])], feedback: false });
  }
}

export default { ndh_question: NdhQuestion };
