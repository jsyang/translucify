module.exports = function (grunt) {
    "use strict";

    var tasksConfig = grunt.file.readJSON("GruntTasks.json");

    tasksConfig.__loadNpmTasks__.forEach(function (taskName) {
        grunt.loadNpmTasks(taskName);
    });

    var key;
    var config = { pkg: grunt.file.readJSON("package.json") };

    for (key in tasksConfig) {
        config[key] = tasksConfig[key];
    }

    grunt.initConfig(config);

    var tasksList = tasksConfig.__gruntTasks__;
    for(key in tasksList) {
        grunt.registerTask(key, tasksList[key].split(','));
    }
};