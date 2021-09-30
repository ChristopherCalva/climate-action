import React, { useContext, useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { AuthContext } from '../userContext'
import { gql, useMutation } from '@apollo/client'

const LOG_IN = gql`
	mutation loginMutation($loginUsername: String!, $loginPassword: String!) {
		login(username: $loginUsername, password: $loginPassword) {
			token
			_id
			username
		}
	}
`

function Login() {
	const { user, setUser } = useContext(AuthContext)
	const [login, { data, loading, error }] = useMutation(LOG_IN)
	const [usernameInput, setUsernameInput] = useState('')
	const [passwordInput, setPasswordInput] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	let history = useHistory()

	if (user.token !== '') {
		return <Redirect to="/posts"></Redirect>
	}

	async function signIn(e) {
		e.preventDefault()
		if (usernameInput === '' || passwordInput === '') {
			setErrorMessage('Form is incomplete')
		} else {
			let userLogin = await login({
				variables: {
					loginUsername: usernameInput,
					loginPassword: passwordInput,
				},
			})

			if (userLogin.data.login.token !== '') {
				setErrorMessage('')
				setUsernameInput('')
				setPasswordInput('')
				setUser({
					token: userLogin.data.login.token,
					_id: userLogin.data.login._id,
					username: userLogin.data.login.username,
					authenticated: true,
				})
			} else if (userLogin.data.login._id === 'notfound') {
				// TODO: ADD ERROR HANDLING TO RESOLVER TO IDENTIFY ISSUE OUTSIDE OF FRONT END
				setErrorMessage('User does not exist.')
			} else {
				setErrorMessage('Username and password do not match. Please try again.')
			}
		}
	}
	return (
		<div className="Login">
			<h1>Login</h1>
			<form onSubmit={signIn}>
				<label for="username">Username: </label>
				<input
					type="text"
					id="username"
					name="username"
					value={usernameInput}
					required
					minLength="5"
					onChange={(e) => setUsernameInput(e.target.value)}
				/>
				<br />
				<label for="password">Password: </label>
				<input
					type="password"
					id="password"
					name="password"
					value={passwordInput}
					required
					minLength="5"
					onChange={(e) => setPasswordInput(e.target.value)}
				/>
				<br />
				<input type="submit" value="Submit" />
			</form>
			<p>{errorMessage}</p>
		</div>
	)
}

export default Login
