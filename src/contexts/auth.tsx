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
    price: string;
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

interface EditProductProps {
    productId: string;
    category: string;
    name: string;
    price: string;
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
    editProduct: ({ productId, category, name, price }: EditProductProps) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
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
    stockTransfer: async () => {},
    editProduct: async () => {},
    deleteProduct: async () => {},
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
            const stockRef = firestore().collection('products').doc(productId)
                .collection('stock').doc(storeId);
    
            const stockDoc = await stockRef.get();
    
            if (!stockDoc.exists) {
                console.log("Documento de estoque não encontrado.");
                return;
            }
    
            const stockData = stockDoc.data();
            const previousStockQuantity = stockData?.quantity || 0;
    
            const newStockQuantity = previousStockQuantity + quantity;
    
            await stockRef.update({
                quantity: newStockQuantity
            });
    
            const productRef = firestore().collection('products').doc(productId);
            const productDoc = await productRef.get();
    
            if (!productDoc.exists) {
                console.log("Documento de produto não encontrado.");
                return;
            }
    
            const productData = productDoc.data();
            const previousProductQuantity = productData?.quantity || 0;
    
            const newProductQuantity = previousProductQuantity + quantity;
    
            await productRef.update({
                quantity: newProductQuantity
            });
    
            console.log("Quantidade de estoque e quantidade total do produto atualizadas com sucesso.");
        } catch (error) {
            console.error("Erro ao atualizar a quantidade de estoque:", error);
        }
    }
    
    
    
    

    async function stockTransfer({ quantity, productId, sourceStoreId, destinationStoreId }: StockTransferProps) {
        console.log(quantity, productId, sourceStoreId, destinationStoreId)

        try {
            // Referência para o documento da loja de origem
            const sourceStockRef = firestore().collection('stores').doc(sourceStoreId)
            const sourceStockDoc = await sourceStockRef.get();

            if (!sourceStockDoc.exists) {
                console.log("Documento de estoque na loja de origem não encontrado.");
                return;
            }
            const sourceStockData = sourceStockDoc.data();

            // Referência para o documento do estoque do produto na loja de origem
            const updateSourceStock = firestore().collection('products').doc(productId)
                .collection('stock').doc(sourceStoreId);

            const updateSourceStockDoc = await updateSourceStock.get();
            const updateSourceStockData = updateSourceStockDoc.data();

            // atualiza a quantidade atual da loja de origem
            if (updateSourceStockData) {
                const newSourceQuantity = updateSourceStockData.quantity - quantity;
                await updateSourceStock.update({ quantity: newSourceQuantity });
            }


            // Referência para o documento da loja destino
            const destinationStoreRef = firestore().collection('stores').doc(destinationStoreId)
            const destinationStoreDoc = await destinationStoreRef.get();
            if (!destinationStoreDoc.exists) {
                console.log("Documento de estoque na loja de destino não encontrado.");
                return;
            }
            const destinationStockData = destinationStoreDoc.data();

            // Referência para o documento do estoque do produto na loja de destino
            const updateDestinationStock = firestore().collection('products').doc(productId)
                .collection('stock').doc(destinationStoreId);

            const updateDestinationStockDoc = await updateDestinationStock.get();
            const updateDestinationStockData = updateDestinationStockDoc.data();

            // Verificar se o documento de estoque da loja de destino existe
            if (updateDestinationStockDoc.exists) {
                const updateDestinationStockData = updateDestinationStockDoc.data();
                const newDestinationQuantity = updateDestinationStockData?.quantity + quantity;

                // Atualizar os dados do documento de estoque da loja de destino
                await updateDestinationStock.update({ quantity: newDestinationQuantity });
            } else {
                // Caso o documento de estoque da loja de destino não exista, criá-lo
                await updateDestinationStock.set({ 
                    storeId: destinationStoreId,
                    productId: productId,
                    quantity: quantity 
                });
            }
    
        } catch (error) {
            console.error('Erro ao transferir estoque:', error);2
        }
    }

    async function editProduct({ productId, category, name, price }: EditProductProps) {
        try {
            firestore().collection('products').doc(productId).update({
                category: category, 
                name: name,
                price: price,
            }).catch(error => {
                console.log(error);
            });
        } catch (error) {
            console.log("Falha ao editar o produto:", error);
        }
    } 

    async function deleteProduct(productId: string) {
        try {
            const productRef = firestore().collection('products').doc(productId);
            
            const stockSnapshot = await productRef.collection('stock').get();
            const batch = firestore().batch();
            stockSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            
            await productRef.delete();
            
            console.log('Produto excluído com sucesso');
        } catch (error) {
            console.error('Erro ao excluir o produto:', error);
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
        stockTransfer,
        editProduct,
        deleteProduct
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