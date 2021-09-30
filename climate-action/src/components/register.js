import React, { useContext, useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { AuthContext } from '../userContext'
import { gql, useMutation } from '@apollo/client'

const ADD_USER = gql`
	mutation registerUserMutation(
		$registerUsername: String!
		$registerPassword: String!
		$registerEmail: String!
	) {
		register(
			username: $registerUsername
			password: $registerPassword
			email: $registerEmail
		) {
			token
			_id
			username
		}
	}
`

function Register() {
	const { user, setUser } = useContext(AuthContext)
	const [addUser, { data, loading, error }] = useMutation(ADD_USER)
	const [usernameInput, setUsernameInput] = useState('')
	const [passwordInput, setPasswordInput] = useState('')
	const [emailInput, setEmailInput] = useState('')
	const [registerFormMessage, setRegisterFormMessage] = useState('')
	const history = useHistory()

	if (user.token !== '') {
		return <Redirect to="/posts"></Redirect>
	}

	async function registerUser(e) {
		e.preventDefault()
		if (usernameInput === '' || passwordInput === '' || emailInput === '') {
			setRegisterFormMessage('Form is incomplete')
		} else {
			let newUser = await addUser({
				variables: {
					registerUsername: usernameInput,
					registerPassword: passwordInput,
					registerEmail: emailInput,
				},
			})
			if (newUser.data.register.token !== '') {
				setRegisterFormMessage('')
				setUsernameInput('')
				setPasswordInput('')
				setEmailInput('')
				setUser({
					token: newUser.data.register.token,
					_id: newUser.data.register._id,
					username: newUser.data.register.username,
					authenticated: true,
				})
			} else {
				setRegisterFormMessage(
					'User with that username or email already exists'
				)
			}
		}
	}
	return (
		<div className="Register">
			<h1>Register</h1>
			<form onSubmit={registerUser}>
				<label htmlFor="username">Username: </label>
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
				<label htmlFor="password">Password: </label>
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
				<label htmlFor="email">Email address: </label>
				<input
					type="email"
					id="email"
					name="email"
					value={emailInput}
					required
					minLength="5"
					onChange={(e) => setEmailInput(e.target.value)}
				/>
				<br />
				<input type="submit" value="Submit" />
			</form>
			<p>{registerFormMessage}</p>
		</div>
	)
}

export default Register
