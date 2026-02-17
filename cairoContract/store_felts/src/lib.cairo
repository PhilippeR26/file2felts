// store large quantity of felt252
// Coded with Cairo 2.15.1
// contract not audited ; use at your own risks.

#[starknet::interface]
trait IstorageFelts<TContractState> {
    fn get_size_bytes(self: @TContractState) -> u16;
    fn get_file(self: @TContractState) -> BinaryFile;
    fn get_storage_timestamp(self: @TContractState) -> u64;
}

#[derive(Copy, Drop, Serde)]
struct BinaryFile {
    size_bytes: u16,
    numbers: Span<felt252>,
}


#[starknet::contract]
mod StorageFelts {
    use starknet::get_block_timestamp;
    use starknet::storage::{
        MutableVecTrait, StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use super::BinaryFile;


    #[storage]
    struct Storage {
        size_bytes: u16,
        data: Vec<felt252>,
        creation_date: u64, // Unix timestamp. Unit = second
    }

    #[constructor]
    fn constructor(ref self: ContractState, file: BinaryFile) {
        self.size_bytes.write(file.size_bytes);
        for i in 0..file.numbers.len() {
            self.data.push(*file.numbers[i]);
        }
        self.creation_date.write(get_block_timestamp());
    }

    #[abi(embed_v0)]
    impl TestFelt of super::IstorageFelts<ContractState> {
        fn get_size_bytes(self: @ContractState) -> u16 {
            self.size_bytes.read()
        }

        fn get_file(self: @ContractState) -> BinaryFile {
            let mut data = array![];
            for i in 0..self.data.len() {
                data.append(self.data[i].read());
            }
            BinaryFile { size_bytes: self.size_bytes.read(), numbers: data.span() }
        }

        fn get_storage_timestamp(self: @ContractState) -> u64 {
            self.creation_date.read()
        }
    }
}
