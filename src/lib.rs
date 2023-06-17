#![no_std]                
use gstd::{prelude::*,Encode,Decode,TypeInfo,Debug,msg,HashMap,Clone,ActorId};
//module ActorId of crate GSTD

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
pub struct Coordstruct{
    latitud:String,
    longitud:String,
}

#[derive(Encode, Decode, TypeInfo, Debug)]
pub struct Outsitestruct{
    idx:i32,
    latitud:String,
    longitud:String,
}

static mut DEPLOYER: Option<ActorId> = None;
static mut MAPEO: Option<HashMap<i32, Coordstruct>> = None;
static mut WALLETSEEDERS: Option<Vec<ActorId>> = None;
static mut WALLETCURATOR: Option<Vec<ActorId>> = None;
//------------------------------------------------------------

#[no_mangle]
extern "C" fn init(){
    let _init_message: String = msg::load().expect("Can't load the incoming message");
    unsafe { DEPLOYER = Some(msg::source())}; 
    unsafe { MAPEO = Some(HashMap::new())}; 
    unsafe { WALLETSEEDERS = Some(Vec::new())}; 
    unsafe { WALLETCURATOR = Some(Vec::new())}; 
    msg::reply("MAPEO Inicializado", 0).expect("Can't send a `SendHelloReply` message");
}


#[no_mangle]
extern "C" fn handle(){

    let message: InputMessageX = msg::load().expect("Can't decode `InputMessage`");
    let deployerx = unsafe { DEPLOYER.as_mut().expect("The contract is not initialized")};
    let mapeox = unsafe { MAPEO.as_mut().expect("The contract is not initialized")};
    let seedersx = unsafe { WALLETSEEDERS.as_mut().expect("The contract is not initialized")};
    let curatorsx = unsafe { WALLETCURATOR.as_mut().expect("The contract is not initialized")};

    //on developing... Para dar el actor id en el msgreply como string
    /*
    fn parseactorid(typeActorId:ActorId) -> String{
        let actor_id: ActorId = msg::source();
        let ActorId_bytes: [u8; 32] = typeActorId.to_bytes();
        //conflics with library hex
        let ActorId_string: String = hex::encode(ActorId_bytes);
        ActorId_string
    }*/

    //on developing... para comprimir logicas de respuesta que involucren msg reply
    /*
    fn filter_replayall(&seedersx:,actoridx:ActorId){
        if seedersx.contains(&actoridx){
            msg::reply("ERROR Wallet already in list", 0).expect("Cant send a msg"); 
        }
        else{
            seedersx.push(actoridx);         
            msg::reply("Wallet added to seeders", 0).expect("Cant send a msg");
        }    
    }*/

    //imp onlyowner para el add/remove seeder
    //imp curators 
    match message {
        InputMessageX::Addloc(idn,lat,long) => {
            //let loadmsg: InputMessageX = msg::load().expect("Can't decode `InputMessage`");
            let newcoords = Coordstruct{latitud:lat,longitud:long};        
            mapeox.insert(idn,newcoords);         
            msg::reply(&format!("Element {} created", idn), 0).expect("Cant send a msg");    
        },
        InputMessageX::Removeloc(id) => {   
            mapeox.remove(&id);         
            msg::reply(&format!("Element {} removed", id), 0).expect("Cant send a msg");   
        },
        InputMessageX::AddSeeder(actoridx) => {
            //safeadd check
            if seedersx.contains(&actoridx){
                msg::reply("ERROR Wallet already in vect seeders", 0).expect("Error msgreply"); 
            }
            else{
                seedersx.push(actoridx);         
                msg::reply("Wallet added to seeders", 0).expect("Error msgreply");
            }       
        },
        InputMessageX::RemoveSeeder(actoridx) => {   
            seedersx.retain(|&x| x != actoridx);
            msg::reply("Wallet removed from seeders", 0).expect("Error msgreply cant remove a wallet");   
        },
        InputMessageX::AddCurator(actoridx) => { 
            if curatorsx.contains(&actoridx){
                msg::reply("ERROR Wallet already in vect curators", 0).expect("Error msgreply"); 
            }
            else{
                curatorsx.push(actoridx);          
                msg::reply("Wallet added to curators", 0).expect("Error msgreply cant add to curators");
            }                  
        },
        InputMessageX::RemoveCurator(actoridx) => {   
            curatorsx.retain(|&x| x != actoridx);
            msg::reply("Wallet removed from seeders", 0).expect("Error msgreply cant remove a wallet");   
        },
        InputMessageX::SendHelloReply => {
            msg::reply("Hello handler!", 0).expect("Can't send a `SendHelloReply` message");
        }
    }

}

//verify metadata for a program
#[no_mangle]
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Unable to share the metahash");
}

#[derive(Encode, Decode, TypeInfo, Debug)]
pub struct Ecostate{
    deployer:ActorId,
    nsitios: i32,
    sitios: Vec<Outsitestruct>,
    list_seeder_wallet: Vec<ActorId>,
}


#[no_mangle]
extern "C" fn state() {

    //working on locations
    let getmapeo = unsafe { MAPEO.as_ref().expect("Unable to share the state") };
    let vect_state: Vec<Outsitestruct> = getmapeo
    .iter()
    .map(|(idxn, coordstructx)| Outsitestruct{ 
        idx: *idxn, 
        latitud: coordstructx.latitud.clone(),
        longitud:coordstructx.longitud.clone(),
        })
    .collect();

    //unwrap for success result //tryinto if the conv i32 was success
    let vect_state_length:i32 = vect_state.len().try_into().unwrap();
    //working on walletseeders
    let get_list_seeder_wallet = unsafe { WALLETSEEDERS.as_ref().expect("Unable to share the state") }; 
    let getdeployer = unsafe { DEPLOYER.as_ref().expect("Unable to share the state") };

    let ecostatex = Ecostate{
        deployer:*getdeployer,
        nsitios:vect_state_length,
        sitios:vect_state,
        list_seeder_wallet:get_list_seeder_wallet.clone(),
    };
        
    msg::reply(ecostatex, 0).expect("Unable to share the state");
    
    //let state = unsafe {&MAPEO};
    //let state_length = state.len().to_string();
    //let state_length = unsafe { MAPEO.len() }.to_string();
    //let state_length = unsafe { MAPEO.as_ref().unwrap().len() }.to_string();
    //msg::reply(state_length, 0).expect("Unable to share the state");
    //msg::reply(state_length.as_bytes(), 0).expect("Unable to share the state");
    //La función reply espera que el mensaje sea un slice de bytes (&[u8]).
}



