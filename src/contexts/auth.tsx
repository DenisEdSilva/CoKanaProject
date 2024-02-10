import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    uid: string;
    role: string | null;
    name: string | null;
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
    productQuantity: number;
    productPrice: string;
}

interface StockProps {
    stockId: string;
    quantity: number;
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
    registerCategory: ({ category }: { category: string }) => Promise<void>;
    registerStore: ({ newStore }: { newStore: string }) => Promise<void>;
    updateStockQuantity: ({ quantity, stockId }: StockProps) => Promise<void>;
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
    registerStore: async () => {},
    updateStockQuantity: async () => {},
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
						name: name,
                        email: email,
						createdAt: new Date(),
					})
                    setLoadingAuth(false);
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
                    name: userProfileData.name,
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

    async function registerStore({newStore}: {newStore: string}) {
        const storesRef = firestore().collection('stores');

        const newIndex = await firestore().runTransaction(async (transaction) => {
            const indexRef = storesRef.doc('storeIndex');
            const indexDoc = await transaction.get(indexRef);
        
            if (!indexDoc.exists) {
                transaction.set(indexRef, { index: 0 });
                return 0;
            } else {
                const currentIndex = indexDoc.data()?.index;
                const newIndex = currentIndex + 1;
                transaction.update(indexRef, { index: newIndex });
                return newIndex;
            }
        });
        await storesRef.add({
            index: newIndex,
            name: newStore
        });
    }

    async function registerCategory({ category }: { category: string }) {
        const categoriesRef = firestore().collection('categories');
      
        const newIndex = await firestore().runTransaction(async (transaction) => {
            const indexRef = categoriesRef.doc('categoryIndex');
            const indexDoc = await transaction.get(indexRef);
        
            if (!indexDoc.exists) {
                transaction.set(indexRef, { index: 0 });
                return 0;
            } else {
                const currentIndex = indexDoc.data()?.index;
                const newIndex = currentIndex + 1;
                transaction.update(indexRef, { index: newIndex });
                return newIndex;
            }
        });
      
        await categoriesRef.add({
            index: newIndex,
            name: category 
        });
        
      }
      
    async function registerProduct( { productCategory, productName, productQuantity, productPrice}: ProductsProps) {{
        const storesSnapshot = await firestore().collection('stores').where('index', '==', 0).get();
        if (storesSnapshot.empty) {
            throw new Error('No stores found');
        }

        const store = storesSnapshot.docs[0];

        const productRef = await firestore().collection('products').add({
            storeId: store.id,
            category: productCategory,
            name: productName,
            price: productPrice
        });

        await firestore().collection('stock').add({
            storeId: store.id,
            productId: productRef.id,
            quantity: productQuantity
        });
    }}

    async function updateStockQuantity({quantity, stockId} : StockProps) {
        await firestore().collection('stock').doc(stockId).update({
            quantity: quantity
        }).catch(error => {
            console.log(error); 
        })
    }


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
        registerCategory,
        registerStore,
        updateStockQuantity
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