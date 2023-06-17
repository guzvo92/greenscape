#![no_std]

use gstd::{prelude::*,Encode,Decode,TypeInfo,Debug,Clone,ActorId};
use gmeta::{InOut, Metadata};
pub struct HelloMetadata;

#[derive(Encode, Decode, TypeInfo, Debug)]
pub enum InputMessageX {
    Addloc(i32,String,String), 
    Removeloc(i32),
    AddSeeder(ActorId),
    RemoveSeeder(ActorId),
    AddCurator(ActorId),
    RemoveCurator(ActorId),
    SendHelloReply,
}

#[derive(Encode, Decode, TypeInfo, Debug)]
struct Coordstruct{
    latitud:String,
    longitud:String,
}

#[derive(Clone,Encode, Decode, TypeInfo, Debug)]
pub struct Outsitestruct{
    idx:i32,
    latitud:String,
    longitud:String,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Ecostate {
    deployer:ActorId,
    nsitios: i32,
    pub sites: Vec<Outsitestruct>,
    list_seeder_wallet: Vec<ActorId>,
}

impl Metadata for HelloMetadata {
    type Init = InOut<String, String>;
    type Handle = InOut<InputMessageX, String>;
    //type State = InOut< (), Vec<Outsitestruct> >;
    type State = Ecostate;
    type Reply = (); 
    type Signal = ();
    type Others = (); 
 }