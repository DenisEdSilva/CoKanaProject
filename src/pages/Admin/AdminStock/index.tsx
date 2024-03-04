import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Modal, Button } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StockTransfer } from '../../../components/AdminComponents/StockTransfer';
import { ReplenishProduct } from '../../../components/AdminComponents/ReplenishProduct';
import { CategoryList } from '../../../components/AdminComponents/CategoryList';

interface Product {
    id: string;
    category: string;
    storeId: string;
    storeName: string;
    name: string;
    quantity: number;
    price: string;
    stockQuantity: number;
}

interface Category {
    id: string;
    index: number;
    name: string;
}

interface Store {
    id: string;
    name: string;
}

export default function AdminStock() {
    const [storesList, setStoresList] = useState<Store[]>([]);
    const [productsByStore, setProductsByStore] = useState<{ [key: string]: Product[] }>({});
    const [productList, setProductList] = useState<Product[]>([]);
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [openedProductId, setOpenedProdutId] = useState<string | null>(null);
    const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [typeModal, setTypeModal] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [selectedStoreId, setSelectedStoreId] = useState<string>("");
    
    const [productOpened, setProductOpened] = useState(false);

    const productsUnsubsRef = useRef<Record<string, () => void>>({});

    const navigation = useNavigation();
    const isFocused = useIsFocused();


    useEffect(() => {
        if (isFocused) {
            setLoading(true);
    
            const fetchCategories = async () => {
                try {
                    const categoriesSnapshot = await firebase.firestore()
                        .collection('categories')
                        .get();
        
                    const categories: Category[] = categoriesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        index: doc.data().index,
                        name: doc.data().name
                    }));
        
                    setCategoryList(categories);
                    setLoading(false);
                } catch (error) {
                    console.error("Erro ao buscar categorias:", error);
                }
            };

            const fetchProductsAndStores = async () => {
                try {
                    const productsSnapshot = await firebase.firestore()
                        .collectionGroup('products')
                        .get();
            
                    const allProducts: Product[] = [];
                    const productsByStore: { [storeId: string]: Product[] } = {};
            
                    for (const productDoc of productsSnapshot.docs) {
                        const productData = productDoc.data();
                        const productId = productDoc.id;
                        const storeRef = productDoc.ref.parent.parent;
            
                        if (storeRef) {
                            try {
                                const storeDoc = await storeRef.get();
                                const storeData = storeDoc.data();
                                const productName = productData.name; // Nome do produto
                                const storeName = storeData?.name || ''; // Nome da loja
            
                                const stockSnapshot = await storeRef.collection('stock')
                                    .doc(productId)
                                    .get();
            
                                const stockData = stockSnapshot.data();
                                const stockQuantity = stockData?.quantity || 0;
            
                                const product: Product = {
                                    id: productId,
                                    storeId: storeRef.id,
                                    storeName: storeName,
                                    name: productName, 
                                    category: productData.category,
                                    quantity: productData.quantity,
                                    price: productData.price,
                                    stockQuantity: stockQuantity
                                };
                                allProducts.push(product);
            
                                if (!productsByStore[storeRef.id]) {
                                    productsByStore[storeRef.id] = [];
                                }
                                productsByStore[storeRef.id].push(product);
                            } catch (error) {
                                console.error("Erro ao buscar estoque do produto:", error);
                            }
                        }
                    }
                    setProductList(allProducts);
                    setProductsByStore(productsByStore);
                } catch (error) {
                    console.error("Erro ao buscar produtos e lojas:", error);
                }
            };
        
            fetchCategories();
            fetchProductsAndStores();
        }
    }, [isFocused]);

    const toggleCategoryOpen = (categoryId: string) => {
        if (openedCategoryId !== categoryId) {
            setOpenedCategoryId(categoryId);
        } else {
            setOpenedCategoryId(null);
        }
    }
    
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
        }}>
            {
                loading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <ActivityIndicator size={80} color="#14c06c" />
                    </View>
                ) : (
                    <View style={{ 
                        width: '100%', 
                        height: '100%',
                        backgroundColor: "#ffffff",
                        }}
                    >
                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible={modalVisible}
                            onRequestClose={() => {
                                setModalVisible(!modalVisible);
                                setTypeModal("")
                            }}
                        >
                            <View>
                                { typeModal === "StockTransfer" && <StockTransfer productId={selectedProductId} storeId={selectedStoreId} />}
                                { typeModal === "ReplenishProduct" && <ReplenishProduct productId={selectedProductId} storeId={selectedStoreId} />}
                                <Button title="Fechar" onPress={() => {
                                    setModalVisible(!modalVisible);
                                    setTypeModal("")
                                }} />
                            </View>
                        </Modal>

                        <View 
                            style={{ 
                                alignContent: 'center', 
                                alignItems: 'center', 
                                marginBottom: 35, 
                            }}
                        >
                            <Text style={{fontSize: 24, fontWeight: "bold", marginTop: 20, color: "#2f5d50"}}>Estoque</Text>
                        </View>
                        <View 
                            style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                borderTopWidth: 3,
                                borderColor: '#2f5d50',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                            }}
                        >
                            <CategoryList onSelectCategory={toggleCategoryOpen} />
                        </View>
                    </View>
                )
            }
        </View>
    );
}