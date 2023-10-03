//Cairo 2.1.0
use core::option::OptionTrait;
use core::result::ResultTrait;
use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};
use array::{Span, SpanTrait, ArrayTrait};
use serde::Serde;
use starknet::{SyscallResult, Store, StorageBaseAddress};
use traits::{Into, TryInto};

#[starknet::interface]
trait IstorageFelts<TContractState> {
    fn get_size_bytes(self: @TContractState) -> u64;
    fn get_bits_len_bytes(self: @TContractState) -> u16;
    fn get_file(self: @TContractState) -> BinaryFile;
}

#[derive(Copy, Drop, Serde)]
struct BinaryFile {
    size_bytes: u64,
    bits_len: u16,
    len: usize,
    numbers: Span<felt252>,
}

impl ArrayIntoLongString of Into<Array<felt252>, BinaryFile> {
    fn into(self: Array<felt252>) -> BinaryFile {
        BinaryFile { size_bytes: 0, bits_len: 0, len: self.len(), numbers: self.span() }
    }
}

impl BinaryFileStorageAccess of starknet::Store<BinaryFile> {
    fn read(
        address_domain: u32, base: starknet::StorageBaseAddress
    ) -> SyscallResult::<BinaryFile> {
        let size_bytes: u64 = Store::<u64>::read(address_domain, base)?;
        let bl252 = starknet::storage_read_syscall(
            address_domain, starknet::storage_address_from_base_and_offset(base, 1_u8)
        )
            .unwrap();
        let bits_len: u16 = bl252.try_into().unwrap();
        let len252 = starknet::storage_read_syscall(
            address_domain, starknet::storage_address_from_base_and_offset(base, 2_u8)
        )
            .unwrap();
        let len: usize = len252.try_into().unwrap();
        // let len = Store::<u32>::read(address_domain, base)?;

        let mut content: Array<felt252> = ArrayTrait::new();
        let mut offset: u8 = 3;
        loop {
            if offset.into() == len + 3 {
                break ();
            }

            match starknet::storage_read_syscall(
                address_domain, starknet::storage_address_from_base_and_offset(base, offset)
            ) {
                Result::Ok(r) => content.append(r),
                Result::Err(e) => panic(e)
            };

            offset += 1;
        };

        SyscallResult::Ok(BinaryFile { size_bytes, bits_len, len, numbers: content.span(),  })
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, value: BinaryFile
    ) -> SyscallResult::<()> {
        assert(value.len < 255, 'LongString too long for storage');

        Store::<u64>::write(address_domain, base, value.size_bytes)?;
        starknet::storage_write_syscall(address_domain, starknet::storage_address_from_base_and_offset(base, 1_u8),value.bits_len.into()).unwrap();
        starknet::storage_write_syscall(address_domain, starknet::storage_address_from_base_and_offset(base, 2_u8),value.len.into()).unwrap();

        let mut offset: u8 = 3_u8;

        loop {
            if offset.into() == value.len + 3 {
                break ();
            }

            let index = offset - 3;
            let chunk = value.numbers[index.into()];

            match starknet::storage_write_syscall(
                address_domain, starknet::storage_address_from_base_and_offset(base, offset), *chunk
            ) {
                Result::Ok(r) => r,
                Result::Err(e) => panic(e),
            }

            offset += 1;
        };

        SyscallResult::Ok(())
    }

    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<BinaryFile> {
        BinaryFileStorageAccess::read_at_offset(address_domain, base, offset)
    }

    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: BinaryFile
    ) -> SyscallResult<()> {
        BinaryFileStorageAccess::write_at_offset(address_domain, base, offset, value)
    }

    fn size() -> u8 {
        254_u8
    }
}

#[starknet::contract]
mod StorageFelts {
    use array::{Span, SpanTrait};
    use super::{BinaryFile};
    #[storage]
    struct Storage {
        counter: u128,
        file1: BinaryFile,
    }

    #[constructor]
    fn constructor(ref self: ContractState, file: BinaryFile) {
        self.file1.write(file);
    }

    #[external(v0)]
    impl TestFelt of super::IstorageFelts<ContractState> {
        fn get_size_bytes(self: @ContractState) -> u64 {
            let file: BinaryFile = self.file1.read();
            file.size_bytes
        }

        fn get_bits_len_bytes(self: @ContractState) -> u16 {
            let file: BinaryFile = self.file1.read();
            file.bits_len
        }

        fn get_file(self: @ContractState) -> BinaryFile {
            self.file1.read()
        }
    }
}
