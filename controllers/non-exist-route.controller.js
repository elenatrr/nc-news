exports.handleNonExist = (_req, res, _next) => {
  res.status(404).send({ msg: "Route not found" });
};
