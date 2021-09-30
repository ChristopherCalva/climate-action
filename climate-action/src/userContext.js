// import React, { useState, createContext } from 'react'

// export const AuthContext = createContext()

// export const AuthProvider = (props) => {
// 	const [authState, setAuthState] = useState({
// 		_id: '',
// 		token: '',
// 	})

// 	return (
// 		<AuthContext.Provider value={[authState, setAuthState]}>
// 			{props.children}
// 		</AuthContext.Provider>
// 	)
// }

import React, { useState, createContext } from 'react'

export const AuthContext = createContext(null)
