const {
    origin
} = require(`./service_factory.js`),
    __DEVELOPMENT__ = {
        devtool: 'inline-source-map',
        mode: "development",
        devServer: {
            open: true,
            openPage: "test.html",
            contentBase: "./",
            inline: true,
            proxy: {
                '/api': {
                    target: origin,
                    security: false,
                    changeOrigin: true
                },
                '/upload': {
                    target: origin,
                    security: false,
                    changeOrigin: true
                }
            }
        }
    };
module.exports = __DEVELOPMENT__;