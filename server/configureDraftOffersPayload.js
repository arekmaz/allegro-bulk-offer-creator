const R = require("ramda");

const setPath = R.curry((path, value, obj) =>
  R.set(R.lensPath(path), value, obj)
);

module.exports = function configureDraftOffersPayload(userConfig, payload) {
  const {
    config: { rowAssociations, globalAssociations },
    itemTemplate
  } = userConfig;
  return payload.map((contentRow, rowIndex) => {
    const payloadObject = {
      ...itemTemplate
    };
    const payloadWithGlobalAssociations = transformWithGlobalAssociations(
      globalAssociations,
      contentRow,
      payloadObject
    );
    console.log({ payloadWithGlobalAssociations });
    const payloadWithItemDescriptors = rowAssociations.reduce(
      (result, rowAssoc, columnIndex) => {
        const assocDescriptors = createAssocDescriptors(rowAssoc);
        console.log({ assocDescriptors });
        const currentValue = contentRow[columnIndex];
        const withItemDescriptors = assocDescriptors.reduce(
          (res, descriptor) => {
            return applyValueWithDescriptor(currentValue, descriptor, res);
          },
          result
        );
        return withItemDescriptors;
      },
      payloadWithGlobalAssociations
    );
    return payloadWithItemDescriptors;
  });
};
function toGlobalTemplateRegExp(value) {
  return new RegExp(`{${value}}`, "gi");
}
function transformWithGlobalAssociations(globalAssociations, row, payload) {
  return globalAssociations.reduce((result, currentAssociation) => {
    const { itemMappings, template, path } = currentAssociation;
    function getValue(key) {
      const keyIndex = itemMappings.indexOf(key);
      return row[keyIndex];
    }
    const appliedTemplate = itemMappings.reduce((res, mapping) => {
      return res.replace(toGlobalTemplateRegExp(mapping), getValue(mapping));
    }, template);
    return setPath(path, appliedTemplate, result);
  }, payload);
}
function applyValueWithDescriptor(rawValue, descriptor, payload) {
  console.log({ descriptor });
  const { paths, type, template } = descriptor;
  const value = castValue(rawValue, type);
  const content = template ? fillTemplate(template, value) : value;
  return paths.reduce((res, path) => setPath(path, content, res), payload);
}

function fillTemplate(template, value) {
  const stringValue = String(value);
  return template.replace(/{value}/g, stringValue);
}

function createAssocDescriptors(assoc) {
  function stringToPaths(str) {
    return str.split(".");
  }
  function transformStringDesc(str) {
    return {
      type: "string",
      paths: [stringToPaths(str)]
    };
  }
  function transformArrayDesc(arrayDesc) {
    return arrayDesc.map(desc => {
      if (typeof desc === "string") {
        return transformStringDesc(desc);
      }
      // object
      if (Array.isArray(desc)) {
        return {
          type: "string",
          paths: transformArrayPaths(desc)
        };
      }
      return transformObjectDesc(desc);
    });
  }
  function transformArrayPaths(pathsArr) {
    return pathsArr.map(pth => {
      if (typeof pth === "string") {
        return stringToPaths(pth);
      }
      return pth;
    });
  }
  function transformObjectDesc(desc) {
    const { type, paths, template } = desc;
    return {
      template,
      type: type || "string",
      paths: transformArrayPaths(paths)
    };
  }

  if (typeof assoc === "string") {
    return [transformStringDesc(assoc)];
  }
  if (Array.isArray(assoc)) {
    return transformArrayDesc(assoc);
  }
  return [transformObjectDesc(assoc)];
}

function castValue(value, type) {
  const lowerCaseType = type.toLowerCase();
  if (lowerCaseType === "string") {
    return String(value);
  }
  if (lowerCaseType === "date") {
    return new Date(value);
  }
  if (lowerCaseType === "int") {
    return parseInt(value, 10);
  }
  if (lowerCaseType === "float") {
    return parseFloat(value);
  }
  return value;
}
