struct CollectionData {
    next_item_index: Int;
    collection_content: Cell;
    owner_address: Address;
}

trait NftCollection {
    virtual const NFT_COLLECTION_STANDARD_METADATA: String = "meta.json";

    next_item_index: Int;
    collection_content: Cell;
    owner_address: Address;

    abstract inline fun _get_nft_item_state_init(index: Int): StateInit;

    virtual inline fun _get_nft_content(index: Int, individual_content: Cell): Cell {
        let builder: StringBuilder = beginString();
        let idvStr: String = individual_content.asSlice().asString();
        builder.append(idvStr);
        return builder.toCell();
    }

    virtual inline fun _get_collection_data(): CollectionData {
        let builder: StringBuilder = beginString();
        let urlPrefix: String = self.collection_content.asSlice().asString();
        builder.append(urlPrefix);
        builder.append(self.NFT_COLLECTION_STANDARD_METADATA);
        return CollectionData {
            next_item_index: self.next_item_index,
            collection_content: builder.toCell(),
            owner_address: self.owner_address
        };
    }

    
    get fun get_collection_data(): CollectionData {
        return self._get_collection_data();
    }

    get fun get_nft_address_by_index(index: Int): Address {
        let initCode: StateInit = self._get_nft_item_state_init(index);
        return contractAddress(initCode);
    }

    get fun get_nft_content(index: Int, individual_content: Cell): Cell {
        return self._get_nft_content(index, individual_content);
    }
}