var defaultSchema = {
  title: "Person",
  type: "object",
  required: [
    "name",
    "age",
    "date",
    "favorite_color",
    "gender",
    "location",
    "pets",
  ],
  properties: {
    name: {
      type: "string",
      description: "First and Last name",
      minLength: 4,
      default: "Jeremy Dorn",
    },
    age: {
      type: "integer",
      default: 25,
      minimum: 18,
      maximum: 99,
    },
    favorite_color: {
      type: "string",
      format: "color",
      title: "favorite color",
      default: "#ffa500",
    },
    gender: {
      type: "string",
      enum: ["male", "female", "other"],
    },
    date: {
      type: "string",
      format: "date",
      options: {
        flatpickr: {},
      },
    },
    location: {
      type: "object",
      title: "Location",
      properties: {
        city: {
          type: "string",
          default: "San Francisco",
        },
        state: {
          type: "string",
          default: "CA",
        },
        citystate: {
          type: "string",
          description:
            "This is generated automatically from the previous two fields",
          template: "{{city}}, {{state}}",
          watch: {
            city: "location.city",
            state: "location.state",
          },
        },
      },
    },
    pets: {
      type: "array",
      format: "table",
      title: "Pets",
      uniqueItems: true,
      items: {
        type: "object",
        title: "Pet",
        properties: {
          type: {
            type: "string",
            enum: ["cat", "dog", "bird", "reptile", "other"],
            default: "dog",
          },
          name: {
            type: "string",
          },
        },
      },
      default: [
        {
          type: "dog",
          name: "Walter",
        },
      ],
    },
  },
};

// parse url -> merge options -> refreshUI() -> initJsoneditor() -> direct link

/* ------------------------------------------------------------------- data */

var data = {};

var defaultOptions = {
  iconlib: "fontawesome5",
  object_layout: "normal",
  schema: defaultSchema,
  show_errors: "interaction",
  theme: "bootstrap4",
};

var jsoneditor = null;
var directLink = document.querySelector("#direct-link");

var booleanOptionsSelect = document.querySelector("#boolean-options-select");
var head = document.getElementsByTagName("head")[0];
var iconlibSelect = document.querySelector("#iconlib-select");
var iconlibLink = document.querySelector("#iconlib-link");
var libSelect = document.querySelector("#lib-select");
var jsonEditorForm = document.querySelector("#json-editor-form");
var objectLayoutSelect = document.querySelector("#object-layout-select");
var setSchema = document.querySelector("#setschema");
var setValue = document.querySelector("#setvalue");
var showErrorsSelect = document.querySelector("#show-errors-select");
var themeSelect = document.querySelector("#theme-select");
var themeLink = document.querySelector("#theme-link");
var validateTextarea = document.querySelector("#validate-textarea");

var aceConfig = {
  mode: "ace/mode/json",
  selection: false,
  maxLines: Infinity,
  minLines: 5,
};

var outputTextarea = ace.edit("output-textarea", aceConfig);

var schemaTextarea = ace.edit("schema-textarea", aceConfig);

/* -------------------------------------------------------------- parse url */

var parseUrl = function () {
  var url = window.location.search;
  var queryParamsString = url.substring(1, url.length);
  var queryParams = queryParamsString.split("&");

  if (queryParamsString.length) {
    queryParams.forEach(function (queryParam) {
      var splittedParam = queryParam.split("=");
      var param = splittedParam[0];
      var value = splittedParam[1];

      // data query param
      if (param === "data") {
        // compress schema and value
        try {
          data = JSON.parse(LZString.decompressFromBase64(value));
        } catch (reason) {}
      }
    });
  }

  mergeOptions();
};

/* ----------------------------------------------------------- mergeOptions */

var mergeOptions = function () {
  data.options = Object.assign(defaultOptions, data.options);
  refreshUI();
};

/* -------------------------------------------------------------- refreshUI */

var refreshUI = function () {
  // schema
  schemaTextarea.setValue(JSON.stringify(data.options.schema, null, 2));

  // theme
  var themeMap = {
    barebones: "",
    bootstrap3:
      "https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css",
    bootstrap4:
      "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    bootstrap5:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
    html: "",
    spectre: "https://unpkg.com/spectre.css/dist/spectre.min.css",
    tailwind: "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css",
  };
  themeLink.href = themeMap[data.options.theme];
  themeSelect.value = data.options.theme;

  // iconlLib
  var iconLibMap = {
    fontawesome3:
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/3.2.1/css/font-awesome.css",
    fontawesome4:
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.css",
    fontawesome5: "https://use.fontawesome.com/releases/v5.6.1/css/all.css",
    jqueryui:
      "https://code.jquery.com/ui/1.10.3/themes/south-street/jquery-ui.css",
    openiconic:
      "https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic.min.css",
    spectre: "https://unpkg.com/spectre.css/dist/spectre-icons.min.css",
    bootstrap:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css",
  };
  iconlibLink.href = iconLibMap[data.options.iconlib];
  iconlibSelect.value = data.options.iconlib;

  // object_layout
  objectLayoutSelect.value = data.options.object_layout;

  // show_errors
  showErrorsSelect.value = data.options.show_errors;

  // boolean values
  var booleanOptions = booleanOptionsSelect.children;
  for (var i = 0; i < booleanOptions.length; i++) {
    var booleanValue = booleanOptions[i];
    if (data.options[booleanValue.value]) {
      booleanValue.selected = true;
    }
  }

  // libs
  var libMapping = {
    ace_editor: {
      js: [
        "https://cdn.jsdelivr.net/npm/ace-editor-builds@1.2.4/src-min-noconflict/ace.js",
      ],
      css: [],
    },
    choices: {
      js: [
        "https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css",
      ],
    },
    cleavejs: {
      js: ["https://cdn.jsdelivr.net/npm/cleave.js@1.4.7/dist/cleave.min.js"],
      css: [],
    },
    sceditor: {
      js: [
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/sceditor.min.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/formats/bbcode.js",
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/formats/xhtml.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/sceditor@2.1.3/minified/themes/default.min.css",
      ],
    },
    simplemde: {
      js: ["https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"],
      css: ["https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css"],
    },
    select2: {
      js: [
        "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
        "https://cdn.jsdelivr.net/npm/select2@4.0.6-rc.1/dist/js/select2.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/select2@4.0.6-rc.1/dist/css/select2.min.css",
      ],
    },
    selectize: {
      js: [
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/js/standalone/selectize.min.js",
      ],
      css: [
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/css/selectize.min.css",
        "https://cdn.jsdelivr.net/npm/selectize@0.12.6/dist/css/selectize.default.min.css",
      ],
    },
    flatpickr: {
      js: ["https://cdn.jsdelivr.net/npm/flatpickr"],
      css: ["https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"],
    },
    signature_pad: {
      js: [
        "https://cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js",
      ],
      css: [],
    },
    mathjs: {
      js: ["https://cdn.jsdelivr.net/npm/mathjs@5.3.1/dist/math.min.js"],
      css: [],
    },
  };

  if (data.selectedLibs || data.unselectedLibs) {
    var booleanOptions = booleanOptionsSelect.children;
    for (var i = 0; i < booleanOptions.length; i++) {
      var booleanValue = booleanOptions[i];
      if (data.options[booleanValue.value]) {
        booleanValue.selected = true;
      }
    }

    var libSelectChildren = libSelect.children;
    for (var i = 0; i < libSelectChildren.length; i++) {
      var child = libSelectChildren[i];
      child.selected = data.selectedLibs.includes(child.value);
    }

    // remove libraries
    data.unselectedLibs.forEach(function (selectedLib) {
      var concat = libMapping[selectedLib].js.concat(
        libMapping[selectedLib].css
      );
      concat.forEach(function () {
        var className = ".external_" + selectedLib;
        var toRemove = head.querySelector(className);
        if (toRemove) {
          toRemove.parentNode.removeChild(toRemove);
        }
      });
    });

    // add libraries
    data.selectedLibs.forEach(function (selectedLib) {
      // add js
      libMapping[selectedLib].js.forEach(function (js) {
        var scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = js;
        scriptElement.async = false;
        scriptElement.classList.add("external_" + selectedLib);
        head.appendChild(scriptElement);
      });
      // add css
      libMapping[selectedLib].css.forEach(function (css) {
        var linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("type", "text/css");
        linkElement.setAttribute("href", css);
        linkElement.classList.add("external_" + selectedLib);
        head.appendChild(linkElement);
      });
    });
  }

  initJsoneditor();
};

/* --------------------------------------------------------- initJsoneditor */

var initJsoneditor = function () {
  // destroy old JSONEditor instance if exists
  if (jsoneditor) {
    jsoneditor.destroy();
  }

  // new instance of JSONEditor
  jsoneditor = new window.JSONEditor(jsonEditorForm, data.options);

  // listen for changes
  jsoneditor.on("change", function () {
    // output
    var json = jsoneditor.getValue();
    outputTextarea.setValue(JSON.stringify(json, null, 2));

    // validate
    var validationErrors = jsoneditor.validate();
    if (validationErrors.length) {
      validateTextarea.value = JSON.stringify(validationErrors, null, 2);
    } else {
      validateTextarea.value = "valid";
    }
  });
  updateDirectLink();
};

/* ------------------------------------------------------- updateDirectLink */

var updateDirectLink = function () {
  var url = window.location.href.replace(/\?.*/, "");
  url += "?data=";
  url += LZString.compressToBase64(JSON.stringify(data));
  directLink.href = url;
};

/* -------------------------------------------------------- event listeners */

setValue.addEventListener("click", function () {
  jsoneditor.setValue(JSON.parse(outputTextarea.getValue()));
});

setSchema.addEventListener("click", function () {
  try {
    data.options.schema = JSON.parse(schemaTextarea.getValue());
  } catch (e) {
    alert("Invalid Schema: " + e.message);
    return;
  }
  refreshUI();
});

themeSelect.addEventListener("change", function () {
  data.options.theme = this.value || "";
  refreshUI();
});

iconlibSelect.addEventListener("change", function () {
  data.options.iconlib = this.value || "";
  refreshUI();
});

objectLayoutSelect.addEventListener("change", function () {
  data.options.object_layout = this.value || "";
  refreshUI();
});

showErrorsSelect.addEventListener("change", function () {
  data.options.show_errors = this.value || "";
  refreshUI();
});

booleanOptionsSelect.addEventListener("change", function () {
  var booleanOptions = this.children;
  for (var i = 0; i < booleanOptions.length; i++) {
    data.options[booleanOptions[i].value] = booleanOptions[i].selected;
  }
  refreshUI();
});

libSelect.addEventListener("change", function () {
  data.selectedLibs = [];
  data.unselectedLibs = [];

  var libs = this.children;

  for (var i = 0; i < libs.length; i++) {
    if (libs[i].selected) {
      data.selectedLibs.push(libs[i].value);
    } else {
      data.unselectedLibs.push(libs[i].value);
    }
  }
  refreshUI();
});

parseUrl();
