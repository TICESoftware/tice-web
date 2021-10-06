const locations = {};
const colors = ['#fc5c65', '#eb3b5a', '#fd9644', '#fa8231', '#fed330', '#f7b731', '#26de81', '#20bf6b', '#2bcbba', '#0fb9b1', '#45aaf2', '#2d98da', '#4b7bec', '#3867d6', '#a55eea', '#8854d0', '#1e3799', '#0c2461', '#3c6382', '#0a3d62'];
const pseudonyms = ['Red Uakari', 'Narwhal', 'Nudibranch', 'Horseshoe Crab', 'Coelacanth', 'Giant Clam', 'Chicken', 'Flying Fish', 'Eastern Mole', 'Marine Iguana', 'Pallid Sturgeon', 'Opossum', 'Snail', 'Damselfish', 'Pygmy Octopus', 'Barramundi', 'Giant Squid', 'June Bug', 'Maned Wolf', 'Genet', 'Horned Lizard', 'Box Jellyfish', 'Cormorant', 'Starfish', 'Swordfish', 'Gecko', 'Turkey', 'Whale Shark', 'Wolverine', 'Cattle', 'Warthog', 'Walrus', 'Ostrich', 'Piglet Squid', 'Humpback Whale', 'Ladybug', 'Butterfly', 'Glass Frog', 'Elephants', 'Toucan', 'Elephant Seal', 'Teacup Pig', 'Octopus', 'Seahorse', 'Firefly', 'Leafy Seadragon', 'Musk Ox', 'Chameleon', 'Cuttlefish', 'Puffer Fish', 'Zebra Finch', 'Kuhli Loach', 'Lionfish', 'Argonaut', 'Dingo', 'Quetzal', 'Skunk', 'Butterflyfish', 'Hippopotamus', 'Impala', 'White Rhinoceros', 'Proboscis Monkey', 'Snowy Owl', 'Peacock', 'Llama', 'Domesticated Duck', 'Grizzly Bear', 'Kangaroo Rat', 'Tawny Frogmouth', 'Aardvark', 'Axolotl', 'Plover', 'Boar', 'Black Rhinoceros', 'Bison', 'Arabian camel', 'Emu', 'Vole', 'Panther', 'Reindeer', 'Banteng', 'Echidna', 'Tapir', 'Flamingo', 'Takin', 'Okapi', 'Cape Buffalo', 'Bengal Tiger', 'Galapagos Tortoise', 'Great Egret', 'Addax', 'Wildebeest', 'Sumatran Tiger', 'Snares Penguin', 'Pangolin', 'European Wolf', 'Oryx', 'Dwarf Zebu', 'Lion', 'Serow', 'Bactrian Camel', 'Sloth', 'Jaguarundi', 'Weasel', 'Cougars', 'Kudu', 'Donkey', 'Baboon', 'Rockhopper Penguin', 'Coyote', 'Alpaca', 'Mole rat', 'Domestic goat', 'Topi', 'Moose', 'Golden Mole', 'Transcaspian Urial', 'Eland', 'Marbled Polecat', 'Ross Seal', 'Cheetah', 'Spectacled Bear', 'Red Fox', 'Pronghorn', 'Bobcat', 'Horse', 'Tenrec', 'Black Bear', 'Sifaka', 'Mountain Beaver', 'Pig', 'Bearded Pig', 'Puma', 'Manatee', 'Lemming', 'Gorilla', 'Iberian Mole', 'Polar Bear', 'Mallard', 'Mountain Bongo', 'River Dolphin', 'Spotted Hyena', 'Musk Deer', 'American Wolf', 'Liger', 'Orca', 'Mountain Goat', 'Spotted Seal', 'Onager', 'Sitatunga', 'Olingo', 'Colugo', 'African Linsang', 'Numbat', 'Coypu', 'Spinner Dolphin', 'Peccary', 'Dugong', 'Elephant Shrew', 'Barbirusa Pig', 'Muntjac', 'Nyala', 'Owl', 'Chuditch', 'Springhaas', 'Porcupine', 'Kouprey', 'Sloth Bear', 'Dibbler', 'Robin', 'Nilgai', 'Gerenuk', 'Yak', 'Tamandua', 'Klipspringer', 'Southern Viscacha', 'Tahr', 'Mouflon', 'Weddell Seal', 'Miniature Horse', 'Badger', 'Blackbuck', 'Goral', 'Sandpipers', 'Argali', 'Quoll', 'Baikal Seal', 'Pademelon', 'Dibatag', 'Brocket Deer', 'Emperor Tamarin', 'Bighorn Sheep', 'Hartebeest', 'Aoudad', 'Marmot', 'Hog Deer', 'Norway Rat', 'Gaur', 'Caspian Seal', 'Iriomote Cat', 'Anoa', 'Hutia', 'Ibex', 'Ocelot', 'Rhebok', 'Fishing Cat', 'Markhor', 'Kinkajou', 'Paca', 'Caracal', 'Bearded Seal', 'Tayra', 'Pudu', 'Pampas Cat', 'Guanaco', 'Anteater', 'Wallaroo', 'Taruca', 'Lesser Grison', 'Chiru', 'Sable', 'Zebra', 'Pygmy Anteater', 'Cuscus', 'Common Seal', 'Saola', 'Oncilla', 'Snow Leopard', 'Suni', 'Lynx', 'Antelope', 'King Penguin', 'Muskrat', 'Mouse Lemur', 'Greater Bilby', 'Mink', 'Black Squirrel', 'Ribbon Seal', 'Gibbon', 'Zorilla', 'Agouti', 'Springbok', 'Andean Bear', 'Fiordland Penguin', 'Platypus', 'Patgonian Cavy', 'Giant Otter', 'Macaroni Penguin', 'Woodchuck', 'Aardwolf', 'Bush Dog', 'Margay', 'Kob', 'Dhole', 'Crabeater Seal', 'Saiga', 'Ringed Seal', 'Lechwe', 'Beira', 'Tasmanian Devil', 'Elk', 'Humboldt Penguin', 'Puku', 'Galago', 'Gazelle', 'Magellanic Penguin', 'African Buffalo', 'Eurasian Otter', 'Raccoon Dog', 'Tarsier', 'Kowari', 'Fallow Deer', 'Royal Penguin', 'Agile Mangabey', 'Snow Leopard', 'Suslik', 'Blue Monkey', 'Beaver', 'Solenodon', 'Potto', 'Jerboa', 'Pine Marten', 'Chevrotain', 'Arctic Fox', 'Sun Bear', 'Pocket Gopher', 'Fisher', 'Orangutan', 'Stoat', 'Patagonian Opossum', 'Chickadee', 'Langur', 'Gelada Baboon', 'Emperor Penguin', 'Leopard Seal', 'Domestic Sheep', 'Wildcat', 'Tree Hyrax', 'Pygmy Marmoset', 'Kodkod', 'Gundi', 'Zokor', 'Titi', 'Grivet', 'Bearded Saki', 'Pygmy Hog', 'Gelada Monkey', 'Phascogale', 'Pika', 'Mandrill', 'Squirrel Monkey', 'Culpeo', 'Vervet', 'Pygmy Hippopotamus', 'Gerbil', 'Coati', 'Tur', 'Black Stork', 'Giraffe', 'Surili', 'Guenon', 'Honey Badger', 'Tree Squirrel', 'Hedgehog', 'Canary', 'Flying Squirrel', 'Hamster', 'Drill', 'Eastern Cottontail', 'Bonobo', 'Wombat', 'Saki Monkey', 'Jackrabbit', 'Malbrouck', 'Dwarf Mongoose', 'Chipmunk', 'Snowshoe Hare', 'Serval', 'Deer', 'Hummingbird', 'Rabbit', 'Quokka', 'Dwarf Rabbit', 'Aye Aye', 'Gray Seal', 'Chinchilla', 'Duiker', 'Mouse', 'Kangaroo', 'Puffin', 'Bush Baby', 'Sand Cat', 'Kultarr', 'Beluga Whale', 'Monkey', 'Koala', 'Slow Loris', 'Kiwi', 'Bottlenose Dolphin', 'Civet Cat', 'Degu', 'Oribi', 'Lutung', 'Chinstrap Penguin', 'Siamang', 'False Antechinus', 'Elephant Seal', 'Talapoin', 'Gymnure', 'Kipunji', 'Douc', 'Desman', 'Chimpanzee', 'Guinea Pig', 'Colubus', 'Blue Penguin', 'Gentoo Penguin', 'Common Planigale', 'Sugar Glider', 'Mulgara', 'Dormouse', 'Wallaby', 'Clown Fish', 'Clouded Leopard', 'Prairie Dog', 'Antechinus', 'Capybara', 'Macaque', 'Adelie Penguin', 'Harp Seal', 'Binturong', 'Meerkat', 'Dunnart', 'Red Panda', 'Rock Hyrax', 'Dog', 'Fennec Fox', 'Giant Panda', 'Cat', 'Sea Otter'];

function getPseudonym(userId) {
    const pseudonymId = Math.abs(userId.hashCode()) % pseudonyms.length;
    return pseudonyms[pseudonymId];
}
function getUsername(group, userId) {
    let name;
    if (userId in group.members && group.members[userId].info !== undefined) {
        name = group.members[userId].info.publicName;
    }
    if (name === undefined) {
        name = getPseudonym(userId);
    }
    return name;
}
function getColor(userId) {
    const colorId = Math.abs(userId.hashCode()) % colors.length;
    return colors[colorId];
}
function getInitials(username) {
    const nameparts = username.split(' ');
    let initials = nameparts[0].substr(0, 2);
    if (nameparts.length > 1) {
        initials = initials[0] + nameparts[nameparts.length - 1].substr(0, 1);
    }
    return initials;
}

export default {
    updateLocation(group, envelope, container) {
        const { senderId } = envelope;
        const location = { senderId };
        if (container !== undefined) {
            location.timestamp = container.payload.location.timestamp;
            location.coordinates = [container.payload.location.longitude, container.payload.location.latitude];
            location.hAccuracy = container.payload.location.horizontalAccuracy;
        } else {
            location.timestamp = new Date().toISOString();
        }
        location.color = getColor(senderId);
        location.name = getUsername(group, senderId);
        location.initials = getInitials(location.name);
        locations[senderId] = location;
        return locations;
    },
    updateUsername(userId, group) {
        if (locations[userId] !== undefined) {
            locations[userId].name = getUsername(group, userId);
        }
        return locations;
    },
    filterLocations(group) {
        const memberIds = group.memberships.map((member) => member.userId);
        const locationKeys = Object.keys(locations);
        locationKeys.forEach((key) => {
            if (memberIds.indexOf(key) === -1) {
                delete locations[key];
            }
            const tenMinutesAgo = new Date();
            tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
            if (new Date(locations[key].timestamp) < tenMinutesAgo) {
                delete locations[key];
            }
        });
        return locations;
    },
    deleteLocation(userId) {
        delete locations[userId];
        return locations;
    },
    getUsername,
    getColor,
    getInitials,
};

/* eslint-disable no-extend-native, no-bitwise, no-plusplus, func-names */
String.prototype.hashCode = function () {
    let hash = 0; let i; let chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};
/* eslint-enable no-extend-native, no-bitwise, no-plusplus, func-names */
