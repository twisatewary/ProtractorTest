/**
 * Created by Admin on 18-01-2016.
 */
module.exports = function(grunt) {
    var path=require('path');
    grunt.initConfig({

        clean: {
            contents: ["./reports/recent/screenshots/*.png",
                "./reports/xmlfiles/*.xml",
                "./reports/recent/htmlreport/*.html",
                "./logs/*log"
            ]
        },

        pkg: grunt.file.readJSON('../package.json'),
        mkdir: {
            options:{
                mode:766,
                create:['.//reports//xmlfiles','.//reports//recent//screenshots','.//reports//recent//htmlreport']
            },
            target: {
            }
        },

        //To execute batch files as grunt tasks
        run_executables: {
            run: {
                cmd: './run_utilities/Parallel_logs.bat'
            },
            report: {
                cmd: './run_utilities/Report.bat'
            }
        },

        /* Protractor here is a grunt plug-in,
         which takes config file and selenium ports as params*/
        protractor:{
            e2e_tests:{
                configFile:"configurations/config.js"
            },

            auto:{
                options:{
                    keepAlive:true,
                    args:{
                        seleniumPort:4444
                    }
                }
            }
        }
    });

    //Redirecting to the path where below plugins are available
    grunt.file.setBase('../');

    //Load tasks before registering
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-run-executables');

    grunt.task.registerTask('local',['clean','mkdir','protractor:e2e_tests']);
    //grunt.task.registerTask('local',['clean','mkdir','run_executables:run']);
    grunt.registerTask('report','run_executables:report');
};