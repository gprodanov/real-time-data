function safeParseJson(str) {
    let data;
    try {
        data = JSON.parse(str);
    } catch (ex) {
    }
    return data;
}

module.exports = {
    validation: require('./utils-validation'),
    safeParseJson: safeParseJson,
    stringify: o => JSON.stringify(o)
};
