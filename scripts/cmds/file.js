const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    aliases: ["cmdfile", "managefile"],
    version: "1.1.0",
    hasPermssion: 2, // Réservé aux admins
    credits: "Gemini AI",
    description: "Affiche la liste, le contenu ou supprime un fichier de commande",
    commandCategory: "utility",
    usages: "/file | /file view [nom.js] | /file delete [nom.js]",
    cooldowns: 2
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const cmdsPath = path.join(process.cwd(), "scripts", "cmds");

    try {
      const action = args[0];
      let fileName = args[1];

      // S'il y a une action (view ou delete), on prépare le nom du fichier
      if (fileName && !fileName.endsWith(".js")) {
        fileName += ".js";
      }

      // --- ACTION 1 : LIRE / FAIRE SORTIR LE CODE ---
      if (action === "view" || action === "read" || action === "show") {
        if (!fileName) {
          return api.sendMessage("❌ Spécifiez le nom du fichier à lire.\nExemple: `/file view balance.js`", threadID, messageID);
        }

        const filePath = path.join(cmdsPath, fileName);

        if (!fs.existsSync(filePath)) {
          return api.sendMessage(`⚠️ Le fichier \`${fileName}\` n'existe pas.`, threadID, messageID);
        }

        // Lecture du contenu du fichier
        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Envoi du code dans un bloc de texte propre
        return api.sendMessage(
          `📄 **Contenu du fichier :** \`${fileName}\`\n\n\`\`\`javascript\n${fileContent}\n\`\`\``,
          threadID,
          messageID
        );
      }

      // --- ACTION 2 : SUPPRIMER UN FICHIER ---
      if (action === "delete" || action === "remove") {
        if (!fileName) {
          return api.sendMessage("❌ Spécifiez le nom du fichier à supprimer.\nExemple: `/file delete test.js`", threadID, messageID);
        }

        const filePath = path.join(cmdsPath, fileName);

        if (!fs.existsSync(filePath)) {
          return api.sendMessage(`⚠️ Le fichier \`${fileName}\` n'existe pas.`, threadID, messageID);
        }

        fs.unlinkSync(filePath);

        return api.sendMessage(
          `🗑️ **Fichier supprimé !**\n\n📂 \`${fileName}\` a été retiré.\n💡 Faites \`/refresh\` pour appliquer les changements.`,
          threadID,
          messageID
        );
      }

      // --- ACTION 3 : LISTER TOUS LES FICHIERS (Par défaut) ---
      if (!fs.existsSync(cmdsPath)) {
        return api.sendMessage("❌ Impossible de localiser le dossier des commandes.", threadID, messageID);
      }

      const files = fs.readdirSync(cmdsPath);
      const jsFiles = files.filter(f => f.endsWith(".js"));

      if (jsFiles.length === 0) {
        return api.sendMessage("🍁 Le dossier des commandes est vide.", threadID, messageID);
      }

      let msg = `🍀 **COMMANDES TROUVÉES (${jsFiles.length})** :\n\n`;
      jsFiles.forEach((file, index) => {
        msg += `${index + 1}. 🍂 \`${file}\`\n`;
      });
      
      msg += `\n🛠️ **Options :**\n• \`/file view [nom].js\` (Voir le code)\n• \`/file delete [nom].js\` (Supprimer)`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`❌ Erreur : ${error.message}`, threadID, messageID);
    }
  }
};
