const calculateAts = (text)=>{
    if (!text) return 0;
    text = String(text).toLowerCase();

    const keywords = [
        "javascript",
        "react",
        "node",
        "mongodb",
        "express",
        "dsa",
        "algorithms",
        "system design",
        "api",
        "backend"
    ];

    let score =0;
    keywords.forEach(word=>{
        if(text.includes(word)) score+=10;
    })

    if(text.length>2000){
        score+=10;
    }

    if(score>100) score=100;


    return score;
}

export default calculateAts;