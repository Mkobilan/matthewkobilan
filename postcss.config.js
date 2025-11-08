module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-preset-env')({
      browsers: 'last 2 versions',
      stage: 3,
      features: {
        'nesting-rules': true
      }
    }),
    require('autoprefixer')
  ]
};