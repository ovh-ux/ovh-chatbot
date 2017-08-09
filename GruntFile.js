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

    unzip: {
      "<%= unzipDir %>": "archives/ovh-chatbot.zip"
    },

    extractJSON: {
      main: {
        files: [{
          src: ["<%= unzipDir %>/**/*.json"],
          dest: "<%= exportDir %>"
        }]
      }
    },

    compileJSON: {
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

    compress: {
      fr: {
        options: {
          archive: "<%= outputDir %>/fr.zip",
          mode: "zip"
        },
        files: [
          {
            cwd: "<%= workDir %>/fr/",
            src: ["**/*.json"],
            expand: true
          }
        ]
      },
      en: {
        options: {
          archive: "<%= outputDir %>/en.zip",
          mode: "zip"
        },
        files: [
          {
            cwd: "<%= workDir %>/en/",
            src: ["**/*.json"],
            expand: true
          }
        ]
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
    },

    // used for developpement purposes
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: "<%= exportDir %>/",
          src: ["**"],
          dest: "<%= importDir %>/"
        }]
      }
    }
  });

  // Default task(s).
  grunt.registerTask("default", ["clean:reset", "export", "copy", "import"]);

  grunt.registerTask("export", ["clean:all", "unzip", "extractJSON", "clean:all"]);
  grunt.registerTask("import", ["clean:all", "compileJSON", "compress", "clean:all"]);

  grunt.registerTask("dev", ["clean:reset", "unzip", "extractJSON", "copy", "compileJSON", "compress"]);

};
