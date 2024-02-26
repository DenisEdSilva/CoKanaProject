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

interface ProductData {
    category: string;
    name: string;
    price: number;
    quantity: number;
}

interface StockData {
    quantity: number;
    productId: string;
    storeId: string;
}

interface StockTransferProps {
    quantity: number;
    productId: string;
    sourceStoreId: string;
    destinationStoreId: string;
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
    registerProduct: (productData: ProductData, stockData: StockData) => Promise<void>;
    registerCategory: ({ category }: { category: string }) => Promise<void>;
    registerStore: ({ newStore }: { newStore: string }) => Promise<void>;
    updateStockQuantity: ({ quantity, productId }: StockData) => Promise<void>;
    stockTransfer: ({ quantity, productId, sourceStoreId, destinationStoreId }: StockTransferProps) => Promise<void>;
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
    stockTransfer: async () => {}
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
      
      async function registerProduct(productData: ProductData, stockData: StockData) {
        console.log(productData.name)
        console.log(stockData.productId)
    
        try {
            const productRef = await firestore().collection('products').add({
                ...productData
            });
    
            const productId = productRef.id;
    
            stockData.productId = productId;
    
            await productRef.collection('stock').doc(stockData.storeId).set({
                ...stockData
            });
    
            console.log('Produto registrado com sucesso.');
        } catch (error) {
            console.error('Erro ao registrar produto:', error);
            throw error;
        }
    }

    async function updateStockQuantity({ quantity, storeId, productId }: StockData) {
        try {
            // Referência para o documento de estoque do produto na loja específica
            const stockRef = firestore().collection('products').doc(productId)
                .collection('stock').doc(storeId);
    
            const stockDoc = await stockRef.get();
    
            if (!stockDoc.exists) {
                console.log("Documento de estoque não encontrado.");
                return;
            }
    
            // Atualiza a quantidade de estoque na loja específica
            await stockRef.update({
                quantity: quantity
            });
    
            // Referência para o documento do produto
            const productRef = firestore().collection('products').doc(productId);
            const productDoc = await productRef.get();
    
            if (!productDoc.exists) {
                console.log("Documento de produto não encontrado.");
                return;
            }
    
            const productData = productDoc.data();
    
            if (productData && productData.quantity) {
                // Calcula a nova quantidade total do produto
                const currentProductQuantity = productData.quantity || 0;
                const newProductQuantity = currentProductQuantity + (quantity - productData.quantity);
    
                // Atualiza a quantidade total do produto
                await productRef.update({
                    quantity: newProductQuantity
                });
    
                console.log("Quantidade de estoque e quantidade total do produto atualizadas com sucesso.");
            } else {
                console.log("Quantidade de produto não encontrada.");
            }
        } catch (error) {
            console.error("Erro ao atualizar a quantidade de estoque:", error);
        }
    }

    async function stockTransfer({ quantity, productId, sourceStoreId, destinationStoreId }: StockTransferProps) {
        try {
            // Referência para o documento de estoque do produto na loja de origem
            const sourceStockRef = firestore().collection('stores').doc(sourceStoreId)
                .collection('stock').doc(productId);
    
            // Obtém os dados do estoque na loja de origem
            const sourceStockDoc = await sourceStockRef.get();
    
            if (!sourceStockDoc.exists) {
                console.log("Documento de estoque na loja de origem não encontrado.");
                return;
            }
    
            const sourceStockData = sourceStockDoc.data();
    
            if (!sourceStockData || !sourceStockData.quantity) {
                console.log("Quantidade de estoque na loja de origem não encontrada.");
                return;
            }
    
            // Verifica se há estoque suficiente na loja de origem
            const currentSourceQuantity = sourceStockData.quantity;
            if (currentSourceQuantity < quantity) {
                console.log("Estoque insuficiente na loja de origem.");
                return;
            }
    
            // Atualiza a quantidade de estoque na loja de origem
            const newSourceQuantity = currentSourceQuantity - quantity;
            await sourceStockRef.update({
                quantity: newSourceQuantity
            });
    
            // Referência para o documento de estoque do produto na loja de destino
            const destinationStockRef = firestore().collection('stores').doc(destinationStoreId)
                .collection('stock').doc(productId);
    
            // Obtém os dados do estoque na loja de destino
            const destinationStockDoc = await destinationStockRef.get();
    
            // Calcula a nova quantidade de estoque na loja de destino
            const destinationQuantity = destinationStockDoc.exists ? destinationStockDoc.data()?.quantity || 0 : 0;
            const newDestinationQuantity = destinationQuantity + quantity;
    
            // Atualiza a quantidade de estoque na loja de destino
            await destinationStockRef.set({
                productId: productId,
                quantity: newDestinationQuantity
            });
    
            console.log("Transferência de estoque concluída com sucesso.");
        } catch (error) {
            console.error('Erro ao transferir estoque:', error);
        }
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
        updateStockQuantity,
        stockTransfer
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