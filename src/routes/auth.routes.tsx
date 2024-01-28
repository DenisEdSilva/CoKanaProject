import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SellerRoute, AdminRoute } from "./app.routes";
import Login from "../pages/Login";

const Stack = createNativeStackNavigator();

export function AppRoutes(){
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export function AdminRoutes() {
    return <AdminRoute />;
}

export function SellerRoutes() {
    return <SellerRoute />;
}