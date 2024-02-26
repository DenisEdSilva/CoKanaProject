import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { firebase } from '@react-native-firebase/firestore';
import { useAuth } from '../../../contexts/auth';

interface ProductProps {
    categoryId: string;
    productId: string;
    storeId: string;
}

export function ReplenishProduct({ categoryId, productId, storeId }: ProductProps) {
    const [quantity, setQuantity] = useState<number | null>(null);
    const [productInfo, setProductInfo] = useState<any>(null);
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [stockQuantity, setStockQuantity] = useState<number | null>(null);
    const { updateStockQuantity } = useAuth();

    useEffect(() => {
        const fetchProductAndStoreInfo = async () => {
            try {
                const productRef = firebase.firestore().collection('products').doc(productId);
                const productSnapshot = await productRef.get();
                if (productSnapshot.exists) {
                    setProductInfo(productSnapshot.data());
                } else {
                    console.log('Produto não encontrado');
                }

                const storeRef = firebase.firestore().collection('stores').doc(storeId);
                const storeSnapshot = await storeRef.get();
                if (storeSnapshot.exists) {
                    setStoreInfo(storeSnapshot.data());
                } else {
                    console.log('Loja não encontrada');
                }

                const stockRef = firebase.firestore().collection('products').doc(productId)
                                   .collection('stock').doc(storeId);
                const stockSnapshot = await stockRef.get();
                if (stockSnapshot.exists) {
                    setStockQuantity(stockSnapshot.data()?.quantity);
                } else {
                    console.log('Estoque não encontrado');
                }
            } catch (error) {
                console.error('Erro ao buscar informações:', error);
            }
        };

        if (categoryId && productId && storeId) {
            fetchProductAndStoreInfo();
        }
    }, [categoryId, productId, storeId]);

    const handleReplenishProduct = async () => {
        try {
            if (quantity !== null) {
                await updateStockQuantity({
                    quantity: quantity,
                    storeId: storeId,
                    productId: productId
                });
            }
        } catch (error) {
            console.error('Erro ao adicionar produto ao estoque:', error);
        }
    };

    return (
        <View>
            {productInfo && <Text><Text style={{fontWeight: 'bold'}}>Nome do Produto: </Text>{productInfo.name}</Text>}
            {storeInfo && <Text><Text style={{fontWeight: 'bold'}}>Nome da Loja: </Text>{storeInfo.name}</Text>}
            {stockQuantity !== null && <Text>Quantidade em estoque: {stockQuantity}</Text>}
            <TextInput
                placeholder="Quantidade"
                keyboardType="numeric"
                value={quantity?.toString() || ''}
                onChangeText={text => setQuantity(parseInt(text))}
            />
            <Button title="Adicionar produto" onPress={handleReplenishProduct} />
        </View>
    );
}