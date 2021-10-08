import config from "../../../config"
import krakenkv from "krakenkv"

const host = 'http://' + config.KRAKENKV_HOST + ":3000"
console.debug('krakenkv host = ', host)
krakenkv.setHost(host)

export default krakenkv