import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Modal, Button, TouchableOpacity, ScrollView } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import StoreList from '../../../components/AdminComponents/StoreList';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { StockTransfer } from '../../../components/AdminComponents/StockTransfer';
import { ReplenishProduct } from '../../../components/AdminComponents/ReplenishProduct';

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
      
    const toggleProductOpen = ( productId: string ) => {
        if (openedProductId !== productId) {
            setOpenedProdutId(productId);
            setProductOpened(true);
        } else {
            setOpenedProdutId(null);
        }
    }

    const toggleCategoryOpen = (categoryId: string) => {
        if (openedCategoryId !== categoryId) {
            setOpenedCategoryId(categoryId);
        } else {
            setOpenedCategoryId(null);
        }
    }

    const openModalReplenishProduct = (category: string, product: string, storeId: string) => {
        setSelectedCategoryId(category);
        setSelectedProductId(product);
        setSelectedStoreId(storeId);
        setTypeModal("ReplenishProduct");
        setModalVisible(true);
    };

    function openModalStockTransfer () {
        setTypeModal("StockTransfer");
        setModalVisible(true);
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
                                { typeModal === "StockTransfer" && <StockTransfer />}
                                { typeModal === "ReplenishProduct" && <ReplenishProduct categoryId={selectedCategoryId} productId={selectedProductId} storeId={selectedStoreId} />}
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
                            <Text style={{fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#2f5d50"}}>Estoque</Text>
                        </View>
                        <View 
                            style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            {categoryList.filter(category => category.name).map((category) => (
                                <View key={category.id} style={{
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    backgroundColor: '#ffffff', 
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 6,
                                }}>
                                    <View 
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 10,
                                            backgroundColor: '#f8f8f8',
                                            borderTopWidth: 4,
                                            borderColor: openedCategoryId === category.id ? '#4bb30f' : '#3c7a5e',
                                        }}
                                    >
                                        <Text style={{ 
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            marginLeft: "2.5%", 
                                        }}>{category.name}</Text>
                                        <TouchableOpacity style={{
                                            padding: 8,
                                            elevation: 3, 
                                            borderWidth: 1,
                                            width: "15%",
                                            borderColor: '#2f5d50', 
                                            borderRadius: 6,
                                            backgroundColor: openedCategoryId === category.id ? '#4bb30f' : '#3c7a5e',
                                            alignItems: "center",
                                            marginRight: "2.5%"
                                            }}
                                            onPress={() => toggleCategoryOpen(category.id)}
                                        >
                                        <Feather name={openedCategoryId === category.id ? "chevron-up" : "chevron-down"} size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    { openedCategoryId === category.id && (
                                        <View>
                                            {productList.filter(product => product.category === category.id).map((product, index, filteredList) => (
                                                <React.Fragment key={product.id}>
                                                    <View 
                                                        style={{
                                                            width: '100%',
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            padding: 14,
                                                            borderBottomColor: '#c8c8c8',
                                                            borderTopWidth: 3,
                                                            borderColor: openedProductId === product.id ? '#4bb30f' : '#3c7a5e',
                                                        }}    
                                                    >
                                                        <Text
                                                            style={{ fontSize: 16, alignSelf: 'center' }}
                                                        >{product.name}</Text>
                                                        <TouchableOpacity 
                                                            style={{
                                                                padding: 5,
                                                                elevation: 3, 
                                                                borderWidth: 1,
                                                                width: "12%",
                                                                borderColor: '#2f5d50', 
                                                                borderRadius: 6,
                                                                backgroundColor: openedProductId === product.id ? '#4bb30f' : '#3c7a5e',
                                                                alignItems: "center",
                                                                marginRight: "3%"
                                                            }}
                                                            onPress={() => toggleProductOpen(product.id)}
                                                        >
                                                            <Feather name={openedProductId === product.id ? "chevron-up" : "chevron-down"} size={24} color="#fff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                    {openedProductId === product.id && product && category.id && (
                                                        <View key={product.id} style={{
                                                            borderTopWidth: 3,
                                                            borderColor: openedProductId === product.id ? '#4bb30f' : '#3c7a5e',
                                                        }}>
                                                           {Object.keys(productsByStore).map(storeId => {                                                                
                                                                const productInStore = productsByStore[storeId].find(storeProduct => storeProduct.id === product.id);
                                                                if (productInStore) { 
                                                                    return (
                                                                        <View key={storeId}>
                                                                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                                                <View style={{padding: 10, borderBottomWidth: 1, borderColor: '#c8c8c8'}}>
                                                                                    <Text><Text style={{fontWeight: "bold"}}>Loja: </Text>{productInStore.storeName}</Text>
                                                                                    <Text style={{fontSize: 16}}><Text style={{fontWeight: "bold"}}>Quantidade: </Text> {productInStore.stockQuantity}</Text>
                                                                                </View>
                                                                                <View style={{padding: 10, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
                                                                                    <TouchableOpacity  style={{
                                                                                        backgroundColor: '#3c7a5e',
                                                                                        elevation: 3, 
                                                                                        borderRadius: 10,
                                                                                        padding: 10,
                                                                                        marginRight: "2.5%",
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                    onPress={() => openModalReplenishProduct(category.id, product.id, storeId)}
                                                                                    >
                                                                                        <Feather name="plus-circle" size={24} color="white" onPress={() => openModalReplenishProduct(category.id, product.id, storeId)} />
                                                                                    </TouchableOpacity>
                                                                                    <TouchableOpacity style={{ 
                                                                                        backgroundColor: '#3c7a5e',
                                                                                        elevation: 3,
                                                                                        borderRadius: 10,
                                                                                        padding: 10,
                                                                                        marginRight: "2.5%",
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                    }}
                                                                                    onPress={openModalStockTransfer}
                                                                                    >
                                                                                        <Icon name="swap-horiz" size={24} color="white" onPress={openModalStockTransfer} />
                                                                                    </TouchableOpacity>
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    );
                                                                } else {''
                                                                    return null; 
                                                            }
                                                            })}
                                                        </View>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </View>
                                    )}

                                </View>
                                ))
                            }
                        </View>
                    </View>
                )
            }
        </View>
    );
}
