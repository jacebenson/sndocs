"use strict";
var myApp = angular.module('versionApp', []);

angular.module("versionApp", []).controller("MainCtrl", [
  "$scope",
  function($scope) {
    $scope.versions = {
      helsinki: {
        "Developer Documentation":
          "https://developer.servicenow.com/app.do#!/api_doc?v=helsinki",
        "Official Documentation":
          "https://docs.servicenow.com/category/helsinki",
        "1": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0594814",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-1.html",
          "Gitlab Source": ""
        },
        "2": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0596138",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-2.html",
          "Gitlab Source": ""
        },
        "3": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0596689",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-3.html",
          "Gitlab Source": ""
        },
        "4": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0597395",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-4.html",
          "Gitlab Source": ""
        },
        "5": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0597668",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-5.html",
          "Gitlab Source": ""
        },
        "6": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0598105",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-6.html",
          "Gitlab Source": ""
        },
        "7": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0598510",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-7.html",
          "Gitlab Source": ""
        },
        "8": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0596689",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-8.html",
          "Gitlab Source": ""
        },
        "9": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0621356",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-9.html",
          "Gitlab Source": ""
        },
        "9a": {
          "Security Updates": "",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-9a.html",
          "Gitlab Source": ""
        },
        "10": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0622459",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-10.html",
          "Gitlab Source": ""
        },
        "11": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0623092",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-11.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/helsinki/11/scripts/"
        },
        "11b": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0623473",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-11b.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/helsinki/11b/scripts/"
        },
        "12": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0598266",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Helsinki-Patch-12.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/helsinki/12/scripts/"
        },
        "12a": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/helsinki/12a/scripts/"
        }
      },
      istanbul: {
        "Developer Documentation":
          "https://developer.servicenow.com/app.do#!/api_doc?v=istanbul",
        "Official Documentation":
          "https://docs.servicenow.com/category/istanbul",
        "1": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0598954",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-1.html",
          "Gitlab Source": ""
        },
        "2": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0610519",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-2.html",
          "Gitlab Source": ""
        },
        "3": {
          "Security Updates":
            "https://hi.service-now.com/kb_view.do?sysparm_article=KB0621511",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-3.html",
          "Gitlab Source": ""
        },
        "3a": {
          "Security Updates": "",
          "Official Documentation":
            "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-3a.html",
          "Gitlab Source": ""
        },
        "4": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0621819",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-4.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/4/scripts/"
        },
        "5": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0622081",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-5.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/5/scripts/"
        },
        "6": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0622599",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-6.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/6/scripts/"
        },
        "6a": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/6a/scripts/"
        },
        "7": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0623231",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-7.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/7/scripts/"
        },
        "8": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0623642",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-8.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/8/scripts/"
        },
        "9": {
          "Security Updates": "https://hi.service-now.com/kb_view.do?sysparm_article=KB0623814",
          "Official Documentation": "https://docs.servicenow.com/bundle/istanbul-release-notes/page/release-notes/r_Istanbul-Patch-9.html",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/9/scripts/"
        },
        "9a": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source":
            "https://gitlab.com/jacebenson/sndocs/tree/master/sources/istanbul/9a/scripts/"
        }
      },
      jakarta: {
        "1": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source": ""
        },
        "2": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source": ""
        },
        "3": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source": ""
        },
        "4": {
          "Security Updates": "",
          "Official Documentation": "",
          "Gitlab Source": ""
        }
      }
    };
  }
]);
