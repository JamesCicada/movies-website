module.exports = {
    module:{
        defaultRules: [
            {
                test: /\.m?js/,
                type: "javascript/auto",
              },
              {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false,
                },
              },
        ]
    }
}