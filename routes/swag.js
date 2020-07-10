import ConnectSequence from 'connect-sequence';
import ui from "@restroom-mw/ui";


export default (app) => {
  app.route('/test')
  .get(function (req, res, next) {
    // Create a ConnectSequence instance and setup it with the current `req`,
    // `res` objects and the `next` callback
    var seq = new ConnectSequence(req, res, next)

    // build the desired middlewares sequence thanks to:
    // - ConnectSequence#append(mid0, ..., mid1),
    // - ConnectSequence#appendList([mid0, ..., mid1])
    // - and ConnectSequence#appendIf(condition, mid)

    // if (req.query.filter) {
    //   seq.append(productsController.filter)
    // }

    // if (req.query.format) {
    //   seq.append(
    //     productsController.validateFormat,
    //     productsController.beforeFormat,
    //     productsController.format,
    //     productsController.afterFormat
    //   )
    // }

    // // unless #run(), the other methods are chainable:

    // // append the productsController.prepareResponse middleware to the sequence
    // // only if the condition `req.query.format && req.formatedProduct` is true
    // // at the moment where the middleware would be called.
    // // So the condition is tested after the previous middleware is called and thus
    // // if the previous modifies the `req` object, we can test it.
    // seq.appendIf(isProductFormatted, productsController.prepareResponse)
    // .append(productsController.sendResponse)
    // run the sequence
    .append(ui({ path: "./zencode/"}))
    .run()
  })

//   app.param('productId', function (req, res, next, id) {
//     // ... yield the product by ID and bind it to the req object
//   })

  function isProductFormatted (req) {
    return Boolean(req.formatedProduct)
  }
}