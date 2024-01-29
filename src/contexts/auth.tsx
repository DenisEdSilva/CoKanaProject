import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    uid: string;
    role: string | null;
    nome: string | null;
    email: string | null;
}

interface UserSignIn {
    email: string;
    password: string;
}

interface UserSignUp {
    role: string;
    name: string;
    email: string;
    password: string;
}

interface childrenProps {
    children: ReactNode;
}

interface UserProfile {
    role: string;
    name: string;
}

interface ProductsProps {
    productCategory: string;
    productName: string;
    productQuantity: string;
    productPrice: string;
}

interface AuthContextType {
    signed: boolean;
    user: User | null;
    loading: boolean;
    loadingAuth: boolean;
    signIn: ({ email, password }: UserSignIn) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: ({ role, name, email, password }: UserSignUp) => Promise<void>;
    storageUser: (data: User) => Promise<void>;
    registerProduct: ({ productCategory, productName, productQuantity, productPrice }: ProductsProps) => Promise<void>;
    registerCategory: ({ newCategory }: { newCategory: string }) => Promise<void>;
  }

  export const AuthContext = createContext<AuthContextType>({
    signed: false,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    loadingAuth: false,
    loading: false,
    user: null,
    storageUser: async () => {},
    registerProduct: async () => {},
    registerCategory: async () => {},
  });

export default function AuthProvider({ children }:childrenProps) {
    const [user, setUser]  = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingAuth, setLoadingAuth] = useState(false)

    useEffect(() => {
        async function loadStorage() {
            const storageUser = await AsyncStorage.getItem("@cokana")

            if (storageUser) {
                setUser(JSON.parse(storageUser))
                setLoading(false)

            }
            setLoading(false)

        }
        loadStorage()

    }, [])


    async function signUp({role, name, email, password }: UserSignUp) {
		setLoadingAuth(true);

		await auth().createUserWithEmailAndPassword(email, password)
			.then(async (value) => {
				let uid = value.user.uid;
				await firestore().collection('users')
					.doc(uid).set({
                        role: role,
						nome: name,
                        email: email,
						createdAt: new Date(),
					})
					.then(() => {
						let data = {
							uid: uid,
                            role: role,
							nome: name,
							email: value.user.email,
						}
						setUser(data);
						storageUser(data)
						setLoadingAuth(false);
                                                
					})

			})
			.catch((error) => {
				console.log(error);
				setLoadingAuth(false);
			})
	}



    async function signIn({email , password}: UserSignIn) {
        setLoadingAuth(true);

        await auth().signInWithEmailAndPassword(email, password)
            .then(async (value) => {
                let uid = value.user.uid;

                const userProfile = await firestore().collection('users').doc(uid).get();
                let userProfileData = userProfile.data() as UserProfile;
                let data = {
                    uid: uid,
                    role: userProfileData.role,
                    nome: userProfileData.name,
                    email: value.user.email ? value.user.email : null
                };  
                setUser(data);
                storageUser(data);
                setLoadingAuth(false);

            })
            .catch((error) => {
                console.log(error)
                setLoadingAuth(false);

            })
    }

    async function signOut() {
        await auth().signOut();
        await AsyncStorage.clear()
            .then(() => {
                setUser(null)
            })
    }

    async function registerCategory({newCategory}: {newCategory: string}) {
        await firestore().collection('categories').add({
            category: newCategory
        })
    }

    async function registerProduct( { productCategory, productName, productQuantity, productPrice}: ProductsProps) {{
        await firestore().collection('products').add({
            category: productCategory,
            name: productName,
            quantity: productQuantity,
            price: productPrice
        })
    }}

    async function storageUser(data: User) {
        await AsyncStorage.setItem("@cokana", JSON.stringify(data))
    }

    const contextValue: AuthContextType = {
        signed: !!user,
        user,
        loading,
        loadingAuth,
        signIn,
        signOut,
        signUp,
        storageUser,
        registerProduct,
        registerCategory
      };

    return (
        <AuthContext.Provider value={ contextValue }>
            {children}
        </AuthContext.Provider>
    )
 }

 export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };