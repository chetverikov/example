'use strict';

module.exports = {
  assignRoutes: (routes, router, endpoints) => {
    routes.forEach(route => {
      let args = [
        route.path
      ];

      if (route.middlewares && route.middlewares.length) {
        args = args.concat(route.middlewares);
      }

      args.push((req, res, next) => {

        /** ESLint max-nested-callbacks: 0 **/
        endpoints[route.handle](req, res)
          .then(data => res.send(data))
          .catch(next);
      });

      router[route.method](...args);
    });
  }
};
