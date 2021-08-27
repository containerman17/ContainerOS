export default function requestJoinMiddleware(req, res, next) {
    //соберем все данные по запросу
    req.body = Object.assign({}, req.query, req.body, req.params)
    next()
}