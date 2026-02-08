module.exports = {
  icon: true,
  typescript: true,
  dimensions: false,
  svgoConfig: {
    plugins: [
      {
        name: 'removeViewBox',
        active: false,
      },
    ],
  },
}