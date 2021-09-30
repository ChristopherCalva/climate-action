import './App.css'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Login from './components/login'
import Register from './components/register'
import Posts from './components/posts'
import MyPosts from './components/myPosts'
import { AuthContext } from './userContext'

function App() {
	const [user, setUser] = useState(() => {
		const saved = localStorage.getItem('user')
		const initialValue = JSON.parse(saved)
		return (
			initialValue ||
			JSON.stringify({
				token: '',
				_id: '',
				username: '',
				authenticated: false,
			})
		)
	})

	useEffect(() => {
		// storing user
		localStorage.setItem('user', JSON.stringify(user))
	}, [user])

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			<Router>
				<div className="App">
					<h1>Climate Action</h1>
					{user.authenticated ? (
						<div className="Nav">
							<button
								onClick={() => {
									setUser({
										token: '',
										_id: '',
										username: '',
										authenticated: false,
									})
								}}
							>
								Sign Out
							</button>
							<ul>
								<li>
									<Link to="/posts" className="Link">
										Posts
									</Link>
								</li>
							</ul>
						</div>
					) : (
						<div className="Nav">
							<ul>
								<li>
									<Link to="/login" className="Link">
										Login
									</Link>
								</li>
								<li>
									<Link to="/register" className="Link">
										Register
									</Link>
								</li>
							</ul>
						</div>
					)}

					<Switch>
						<Route path="/login">
							<Login />
						</Route>
						<Route path="/register">
							<Register />
						</Route>
						<Route path="/posts">
							<Posts />
						</Route>
						<Route path="/myPosts">
							<MyPosts />
						</Route>
					</Switch>
				</div>
			</Router>
		</AuthContext.Provider>
	)
}

export default App
