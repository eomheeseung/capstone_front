const webpack = require('webpack');

module.exports = function override(config) {

    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "path": require.resolve("path-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        fs:false,
        path:false,
        ost:false,
        child_process:false,
        'mock-aws-s3':false,
        'aws-sdk':false,
        nock:false,
        net:false,
        tls:false,
        
       
 
    })

    
    config.module = {
        
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,  // js 파일들을 읽겠다. 
                exclude: /node_modules/,    // node_modules 는 무시
                use: {
                    loader: "babel-loader",  // loader로는 babel-loader 사용          
                    options: {
                        presets: ['@babel/env','@babel/preset-react'] 
                    }
                }
            },
          {
                test: /\.html$/, 
                loader: 'html-loader' 
              
           
          },
          {
            test : /\.css$/,
            use : ["style-loader", "css-loader"]
        }
          
        ],

        

        
      };

    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        
        })
    ])
    return config;

}