/**
 * @format
 * @flow
 */

import axios from 'axios'
import * as AxiosLogger from 'axios-logger'

/**
 * Requests a URL, with type returning a {object}
 *
 * @param  {string} api         The URL we want to request
 * @param  {string} type        The type of request (get | post | ...)
 * @param  {object} [options]   The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */

import url from '../config/url.config'
import { Storage, constants } from '../utils'

export default RefreshTokenServices = async () => {
	const token = await Storage.shared().getStorage(constants.TOKEN)
	const reFreshToken = await Storage.shared().getStorage(constants.REFRESH_TOKEN)
	const dataResponse = await axios({
		timeout: 30000,
		method: 'post',
		url: url.BASE_URL + url.REFRESH_TOKEN,
		data: { token: reFreshToken },
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token
		}
	})
	return dataResponse.data
}

data : {
	"Authorization_1": "HoangTB1@fsoft.com.vn",
	"Authorization_2": "TuanTB1@fsoft.com.vn"
}