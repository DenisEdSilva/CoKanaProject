import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Home from "../pages/Seller/Home";
import NewItem from "../pages/Seller/NewItem";
import Profile from "../pages/Seller/Profile";
import AdminHome from "../pages/Admin/AdminHome";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminPerfil from "../pages/Admin/AdminPerfil";
import { ProductList } from "../components/AdminComponents/ProductList";
import { ProductItem } from '../components/AdminComponents/ProductItem';
import AdminStock from "../pages/Admin/AdminStock";
import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

interface AddButtonProps {
    onPress: () => void;
    iconName: string;
  }

function Button({ onPress, iconName, navigation }: AddButtonProps & { navigation: any }) {
    return (
        <TouchableOpacity onPress={onPress} >
            <Icon name={iconName} size={24} color="black" />
        </TouchableOpacity>
    );
  }

export function SellerRoute() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarInactiveTintColor: "#000",
                tabBarActiveTintColor: "#3c7a5e",
                tabBarItemStyle: {                
                    alignItems: "center",
                    justifyContent: "center",   
                },
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: "bold"
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={({ navigation }) => ({
                    tabBarIcon: () => <Button iconName="home" onPress={() => navigation.navigate('Home')} navigation={navigation} />,
                    tabBarLabel: () => null,
                })}
            />
            <Tab.Screen
                name="adicionar"
                component={NewItem}
                options={({ navigation }) => ({
                    tabBarIcon: () => <Button iconName="add" onPress={() => navigation.navigate('adicionar')} navigation={navigation} />,
                    tabBarLabel: () => null,
                })}
            />
            <Tab.Screen
                name="Perfil"
                component={Profile}
                options={({ navigation }) => ({
                    tabBarIcon: () => <Button iconName="person" onPress={() => navigation.navigate('Perfil')} navigation={navigation} />,
                    tabBarLabel: () => null,
                })}
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
                tabBarActiveTintColor: "#3c7a5e",
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
                name="Estoque"
                component={AdminStockStack}
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

const Stack = createNativeStackNavigator();

const AdminStockStack = () => {
  return (
    <Stack.Navigator  
        screenOptions={{ headerShown: false }}  
    >
        <Stack.Screen name="AdminStock" component={AdminStock} />
        <Stack.Screen name="ProductList" component={ProductList} />
        <Stack.Screen name="ProductItem" component={ProductItem} />
    </Stack.Navigator>
  );
};