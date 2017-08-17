const _ = require("lodash");

const LANGUAGES = ["fr", "de", "en", "es", "it"];

module.exports = function (grunt) {
  "use strict";
  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
  grunt.loadTasks("./tools");

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    workDir: ".wrk",
    exportDir: "<%= workDir%>/export",
    importDir: "<%= workDir%>/import",
    unzipDir: "<%= workDir%>/extract",
    outputDir: "<%= workDir%>/output",
    apiaiDir: "apiai",

    unzip: {
      "<%= unzipDir %>": "apiai/archives/ovh-chatbot.zip"
    },

    zip2json: {
      main: {
        files: [{
          src: ["<%= unzipDir %>/**/*.json"],
          dest: "<%= exportDir %>"
        }]
      }
    },

    apiai2json: {
      main: {
        files: [{
          src: ["<%= exportDir %>/**/*.json"],
          dest: "<%= apiaiDir %>"
        }]
      }
    },

    json2apiai: {
      options: {
        template: "<%= apiaiDir %>/template.json"
      },
      main: {
        files: [{
          src: ["<%= apiaiDir %>/translations/**/apiai_*.json"],
          dest: "<%= importDir %>"
        }]
      }
    },

    json2zip: {
      options: {
        original: "<%= unzipDir %>"
      },
      main: {
        files: [{
          src: ["<%= importDir %>/**/*.json"],
          dest: "<%= workDir %>"
        }]
      }
    },

    compress: _.fromPairs(_.map(LANGUAGES, (lang) => [lang, {
      options: {
        archive: `<%= outputDir %>/${lang}.zip`,
        mode: "zip"
      },
      files: [{
        cwd: `<%= workDir %>/${lang}/`,
        src: ["**/*.json"],
        expand: true
      }]
    }])),

    // compress: {
    //   all: [
    //     {
    //       options: {
    //         archive: "<%= outputDir %>/fr.zip",
    //         mode: "zip"
    //       },
    //       files: [
    //         {
    //           cwd: "<%= workDir %>/fr/",
    //           src: ["**/*.json"],
    //           expand: true
    //         }
    //       ]
    //     },
    //     {
    //       options: {
    //         archive: "<%= outputDir %>/en.zip",
    //         mode: "zip"
    //       },
    //       files: [
    //         {
    //           cwd: "<%= workDir %>/en/",
    //           src: ["**/*.json"],
    //           expand: true
    //         }
    //       ]
    //     },
    //     {
    //       options: {
    //         archive: "<%= outputDir %>/es.zip",
    //         mode: "zip"
    //       },
    //       files: [
    //         {
    //           cwd: "<%= workDir %>/es/",
    //           src: ["**/*.json"],
    //           expand: true
    //         }
    //       ]
    //     }
    //   ],
    // },

    upload: {
      options: {
        filter: (agent) => agent.name.indexOf("-prod") === -1, // Filter function: doesn't upload for production yet
        reset: false
      },
      main: {
        files: {
          src: "<%= outputDir %>"
        }
      }
    },

    clean: {
      reset: ["<%= workDir %>"],
      all: [
        "<%= workDir %>/*",
        "!<%= exportDir %>",
        "!<%= importDir %>",
        "!<%= outputDir %>"
      ]
    }
  });

  // Default task(s).
  grunt.registerTask("default", ["clean:reset", "export", "import"]);

  grunt.registerTask("export", ["clean:all", "unzip", "zip2json", "apiai2json", "clean:all"]);
  grunt.registerTask("import", ["clean:all", "json2apiai", "json2zip", "compress", "upload", "clean:all"]);

  grunt.registerTask("dev", ["clean:reset", "unzip", "zip2json", "apiai2json", "json2apiai", "json2zip", "compress"]);

};
