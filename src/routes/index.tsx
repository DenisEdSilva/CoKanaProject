import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";

import { SellerRoutes, AdminRoutes, AppRoutes } from "./auth.routes";
import { AuthContext } from "../contexts/auth";



function Routes() {
    const { signed, loading, user } = useContext(AuthContext)

	if (loading) {
		return (
			<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#36393f'
			}}
			>
				<ActivityIndicator
					size={50}
					color="#7dfF17"
				/>
			</View>
		
		)
	}

	if (signed == true) {
		if (user?.role === "admin") {
			return <AdminRoutes />;
		} else if (user?.role === 'seller') {
			return <SellerRoutes />;

		}
	} else {
		return <AppRoutes />
	}

}

export default Routes;  