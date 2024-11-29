import multiplierPaths from '../assets/json/multiplierPaths.json';
import riskMultipliers from '../assets/json/riskMultipliers.json'
export default class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.userCredits = 10000;
        this.betAmount = 100;
        this.multiplierBoxes = [];
        this.pegs = {};
        this.currentRisk = 'medium';
        this.currentRows = 8;
        this.multiplierPaths = multiplierPaths;
        this.riskMultipliers = riskMultipliers;
    }

    getCurrentMultipliers() {
        return this.riskMultipliers[this.currentRisk][`${this.currentRows}`];
    }

    setRows(rows) {
        this.currentRows = rows;
    }

    setRisk(risk) {
        this.currentRisk = risk;
    }
    async placeBet() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "cookie": "intercom-device-id-cuj909lm=8d24c5b3-d770-400e-9d85-02abfd74330b; intercom-id-cuj909lm=6c93487b-80d7-40b0-9f80-0c113e1940a0; country=AE-DU; ph_phc_KFg4gnwtxG9aLTo5YraZVajSSLF8aal0UoIrXgfYCH0_posthog=%7B%22distinct_id%22%3A%2265e8686a1342735cf89bec30%22%2C%22%24sesid%22%3A%5B1728908577047%2C%2201928af7-431b-76f8-bcd3-2219b22ba468%22%2C1728908313371%5D%2C%22%24epp%22%3Atrue%7D; cf_clearance=DUYOyHEkSbnPRFxxE_Gkn7S14YhMy_L9yKujiMGFOsY-1728910768-1.2.1.1-ZXlQ1cedFViBf6n0w4Iq5kLaT6R_fQENGUN1VO1pM5Yn.gCmu9G.YBaqEuu4auBzsSFgBYndId2itAj.gchNEfwmrzX03NK8uOhoFpiyhEF77Z8Zsq3ugB81kjDnkrmXl1fbS7V2C75EzTgWJJc0aTVKaW0UqHNbBwX22DAqlWPkSq_tCWEYnj86cmA5EU.vz1BesgF.TrEOkk4_e7pTjbl4vSe0GlEvy5N9k5yFxG_n5G2F.awNc3HXoEnjSmlL2Ld4Eh3SmZLMJWhN5SEoa9Lrjc99hkLoYsYItj927HhNf4zVFeLY6EAq353QdsOx53AH33.wA2iFKOsqbC6EidksEar.eyHgPeOkmnT2vnc97U_v0hMojgDsg572TxIAukSV706a0sZqLZWkzaLY2g; session=Ym5fDq7u3N9JZ61wgGaHfpqwQGhfnmBRUp2qVdgAHwp6hMwctbiru28AtqsgwL8s0ra5dJj7f3O4dQ2R7KNOg+xCBci9BPabpiriYUErRq7wBadD6AxHxQ8FGj2myuaqiai5MeXNnV542zCVcBGMDA==; intercom-session-cuj909lm=blllT3hwR1daVWRqUUZBZUpJMHh2cWRUb3k3SVZEQ3lFKzA5VERQa0F5d05KbHhoSERwNnN6cUw2Vk4vQ0VEdC0tU3hJbXJyemxWbXFTRDFSdmtLUFZJdz09--b60a487c0390ec211e7a1a68974851cfbe91ebcc; AWSALB=LAkCaXxUxgg81R7dxj/HfZzeVXUZo8yVmPs6ggAieV3zVXOsmGxYhhNQWpNf3NAYy2ZJC9AZ02tMKfX0JRfC+XsXhh6hSIa++BojM1fVQrrVIDxbIsmT5YUJnfAH; ph_phc_y9rx63Z28Mg360YWdDDttPB3sZ8sdnd4L9DaoebMCeg_posthog=%7B%22distinct_id%22%3A%226583893a2b5eed4f0f2a0d78%22%2C%22%24sesid%22%3A%5B1728912527940%2C%2201928b1c-b727-7bf0-ae9d-25cf93ebfcb2%22%2C1728910767911%5D%2C%22%24epp%22%3Atrue%7D",
            "data": {
                "amount": 0,
                "currency": "ETH",
                "risk": this.currentRisk === 'low' ? 1 : this.currentRisk === 'medium' ? 2 : 3,
                "rows": this.currentRows
            }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const response = await fetch("http://13.201.81.217:3001/placeBetPlinko", requestOptions);
        const result = await response.json();
        try {
            if (result.success) {
                return result.data;
            }
            else {
                console.error(result.message);
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}