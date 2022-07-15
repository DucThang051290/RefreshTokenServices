import axios from 'axios'
import * as AxiosLogger from 'axios-logger'

import url from '../config/url.config'
import RefreshTokenServices from './RefreshTokenServices'
import { Storage, constants, Helpers } from '../utils'
import * as NavigationService from '../config/navigation.config'
import localization from '../assets/localization'
import LocationServices from '../locationServices'


class AxiosServices {

	constructor() {
		const instance = axios.create({
			timeout: 30000,
			headers: {
				"Content-Type": "application/json",
			}
		})
		if(__DEV__){
			instance.interceptors.request.use(AxiosLogger.requestLogger)
		}
		instance.interceptors.response.use(this._handleSuccess, this._handleError)
		this.instance = instance
	}

	_handleSuccess(response) {
		return response
	}

	_handleError(error) {
		const originalRequest = error.config
		if (!error.response) {
			return Promise.reject({ response: { data: { error: { code: 'networkError' } } } })
		} else if (error.response.status == 502) {
			if (error.response.data.message) {
				Helpers.showError(error.response.data.message)
			}
			return Promise.reject({ response: { data: { error: { code: 'serverError' } } } })
		} else if (!error.response.data.error.code) {
			return Promise.reject({ response: { data: { error: { code: 123 } } } })
		} else if ((error.response.data.error.code == constants.TOKEN_EXPIRED) && !originalRequest._retry) {
			originalRequest._retry = true
			return RefreshTokenServices()
				.then(response => {
					const { accessToken, refreshToken } = response.data
					Storage.shared().setStorage(constants.TOKEN, accessToken)
					Storage.shared().setStorage(constants.REFRESH_TOKEN, refreshToken)
					originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
					return axios(originalRequest)
				})
				.catch(err => {
					return Promise.reject(err)
				})
		} else if (error.response.data.error.code == constants.LOGIN_ANOTHER_DEVICE) {
			Storage.shared().clearStorage(constants.isLogin)
			Storage.shared().clearStorage(constants.TOKEN)
			LocationServices.stop()
			Helpers.showError(localization.anotherDevice)
			NavigationService.navigate(constants.Login)
			return Promise.reject(error)
		} else {
			return Promise.reject(error)
		}
	}

	// _handleExpiredToken() {
	// 	LocationServices.stop()
	// 	Storage.shared().clearStorage(constants.isLogin)
	// 	Storage.shared().clearStorage(constants.TOKEN)
	// 	Storage.shared().clearStorage(constants.DEVICE_TOKEN)
	// 	Storage.shared().clearStorage(constants.FAVORITE_LOCATION)
	// 	Storage.shared().clearStorage(constants.HISTORY_LOCATION)
	// 	Storage.shared().clearStorage(constants.TRIP_HISTORY)
	// 	NavigationService.navigate(constants.Login)
	// }


	getMethod = async (endPoint) => {
		const token = await Storage.shared().getStorage(constants.TOKEN)
		// console.log(token)
		this.instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
		return this.instance.get(url.BASE_URL + endPoint)
	}

	postMethod = async (endPoint, body = {}) => {
		const token = await Storage.shared().getStorage(constants.TOKEN)
		// console.log(token)
		this.instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
		return await this.instance.post(url.BASE_URL + endPoint, body)
	}

	putMethod = async (endPoint, body = {}) => {
		const token = await Storage.shared().getStorage(constants.TOKEN)
		// console.log(token)
		this.instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
		return await this.instance.put(url.BASE_URL + endPoint, body)
	}

	putLocation = async (body) => {
		const token = await Storage.shared().getStorage(constants.TOKEN)
		// console.log(token)
		this.instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
		return await this.instance.put(url.BASE_URL + url.UPDATE_LOCATION, body)
	}

	getWayPoint = async (url) => {
		return await this.instance.get(url)
	}
}

export default new AxiosServices()