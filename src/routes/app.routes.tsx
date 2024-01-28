import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Home from "../pages/Seller/Home";
import NewItem from "../pages/Seller/NewItem";
import Profile from "../pages/Seller/Profile";
import AdminHome from "../pages/Admin/AdminHome";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminPerfil from "../pages/Admin/AdminPerfil";

const Tab = createBottomTabNavigator();

export function SellerRoute() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarInactiveTintColor: "#000",
                tabBarActiveTintColor: "#0000ff",
                tabBarItemStyle: {                
                    alignItems: "center",
                    justifyContent: "center",   
                },
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: "bold"
                },
                tabBarIconStyle: ({ display: 'none' }),
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
            />
            <Tab.Screen
                name="+"
                component={NewItem}
                options={{
                    tabBarLabelStyle: {
                        fontSize: 45,
                    },   
                    tabBarItemStyle: {
                        backgroundColor: "#80ff80",
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        height: 60,
                        bottom: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 3,
                        borderColor: "#000000",
                    }
                }} 
            />
            <Tab.Screen
                name="Perfil"
                component={Profile}
            />
        </Tab.Navigator>
    )
}

export function AdminRoute() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarInactiveTintColor: "#000",
                tabBarActiveTintColor: "#0000ff",
                tabBarItemStyle: {                
                    alignItems: "center",
                    justifyContent: "center",   
                },
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: "bold"
                },
                tabBarIconStyle: ({ display: 'none' }),
            }}
        >
            <Tab.Screen
                name="Inicio"
                component={AdminHome}
            />
            <Tab.Screen
                name="Produtos"
                component={AdminProducts}
            />
            <Tab.Screen
                name="Perfil"
                component={AdminPerfil}
            />
        </Tab.Navigator>
    )
}