'use client';

import React, { useState, useEffect } from 'react';

type QuizItem = {
  name: string;
  image: string;
};



export default function QuizPage() {
  const [scene, setScene] = useState("loading");
  const [difficulty, setDifficulty] = useState(0);

  const [options, setOptionss] = useState([true, true]);
  
  const [allQuizData, setAllQuizData] = useState<QuizItem[]>([]);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [countCorrect, setCountCorrect] = useState(0);
  const [score, setScore] = useState(0);

  const [choices,setChoices] = useState<string[]>([]);

  const [nameList, setNameList] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const parse_jsonl = (text: string) => {
    const lines = text.trim().split('\n');
    const parsed: QuizItem[] = lines.map((line) => JSON.parse(line));

    setNameList(parsed.map(p => p.name));
    setAllQuizData(parsed);
  }

  const initialize_game = (difficulty: number) => {
    setDifficulty(difficulty);
    setScore(0);
    const reshuffled = [...allQuizData].sort(() => 0.5 - Math.random());
    setQuizList(reshuffled.slice(0, Math.min(10, allQuizData.length)));
    setCurrentIndex(0);
    setScene("game");
  }

  // ひらがなtoカタカナ
  const toKatakana = (str: string) =>
  str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );

  const getFullName = (p: QuizItem) => p.name;

  useEffect(() => {
    fetch('/data/irasutoya_data.jsonl')
    .then((res) => res.text())
    .then(parse_jsonl)
    .then(() => setScene("title"));
  }, []);


  useEffect(() => {
    if (!current) return;

    if (difficulty === 1 || difficulty === 2 || difficulty === 3 ) {
      // 正解
      const correct = getFullName(current);

      // ランダムにダミーを選ぶ（重複を避ける）
      const shuffled = [...nameList].sort(() => 0.5 - Math.random());
      const distractors = shuffled.filter(n => n !== correct).slice(0, 3);

      const options = [...distractors, correct].sort(() => 0.5 - Math.random());
      setChoices(options);
    } else {
      setChoices([]);
    }
  }, [currentIndex, difficulty, nameList]);


  const handleInputChange = (value: string) => {
  setUserAnswer(value);
  const katakanaInput = toKatakana(value.trim());
  if (katakanaInput === '') {
    setSuggestions([]);
    return;
  }
  const filtered = nameList.filter(name =>
    name.startsWith(katakanaInput)
  );
  setSuggestions(filtered);
};

  const current = quizList[currentIndex];



  const handleCheck = () => {
    if (userAnswer.trim() === '') return;

    if (userAnswer.trim() === getFullName(current)) {
      setResult('correct');
      setCountCorrect((prev) => prev + 1);
      setScore(prev => prev + 10);
    } else {
      setResult('wrong');
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setUserAnswer('');
    setResult(null);
    setShowAnswer(false);
  };

  switch(scene) {
    case "loading":
      return (
        <div className="w-screen h-screen flex items-center justify-center">
          <div>読み込み中...</div>
        </div>
      );
    case "title":
      return (
        
      <div className="content flex items-center justify-center">
      <div className="items-center w-full max-w-md text-center">
        <div className="grid grid-cols-5">
          <div></div>
          <div className="content col-span-3 flex flex-col justify-center gap-2">
            <button
              onClick={() => {
                initialize_game(3);
              }}
              className="bg-yellow-500 font-bold text-white py-2 rounded hover:bg-yellow-700"
            >
              選択肢アリ
            </button>
            <button
              onClick={() => {
                initialize_game(4);
              }}
              className="bg-purple-500 font-bold text-white py-2 rounded hover:bg-purple-700"
            >
              選択肢ナシ
            </button>

          </div>
          <div></div>
        </div>          
      </div>
    </div>

      )
    case "game": 
      if (currentIndex >= quizList.length) {
        return (
          <div className="h-[calc(80vh)] w-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-4">クイズ終了！</h1>
            <h1 className="text-2xl font-bold mb-4">10問中 {countCorrect}問 正解！</h1>
            <h1 className="text-2xl font-bold mb-4">スコア: {score}</h1>
            <button
              onClick={() => {
                const reshuffled = [...allQuizData].sort(() => 0.5 - Math.random());
                setQuizList(reshuffled.slice(0, Math.min(10, allQuizData.length)));
                setCurrentIndex(0);
                setResult(null);
                setShowAnswer(false);
                setUserAnswer('');
                setScene("title");
                setCountCorrect(0);
              }}
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              もう一度遊ぶ
            </button>
          </div>
        );
      }

      return (
        <div className="grid grid-rows-20 h-[calc(80vh)] flex items-center justify-center">
          <div className="row-span-2 w-full max-w-md text-center">
            <h1 className="text-xl font-bold mt-4"> {currentIndex + 1} / {quizList.length}</h1>
            {/* <progress
              value={(currentIndex + 1) / 10}
              className='rounded-full bg-black'
            /> */}
            <p className="mb-2 text-gray-600">このイラストは何？</p>

          </div>
          <div className="row-span-5 h-full max-w-md text-center mx-auto">
            <img
              src={`/irasutoya_images/${current.image}`}
              alt={`クイズ画像 ${currentIndex + 1}`}
              className="h-full max-w-md object-cover"
            />
          </div>

          <div className="row-span-13 h-full max-w-md flex text-center justify-center">
            {!showAnswer ? (
              <>
                {(difficulty === 1) || (difficulty === 2) || (difficulty === 3)? (
                  //選択肢形式
                  <div className='content grid grid-rows-7 gap-2 w-[calc(90vw)] text-center py-2'>
                    {choices.map((choices,idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          //setUserAnswer(choices);これだと二回目のクリックでしか反応しないため直接判定
                          choices === getFullName(current) ?
                            ( setResult('correct'),
                              setCountCorrect(prev => prev + 1),
                              setScore(prev => prev + 10)
                            )
                            : setResult('wrong');
                          setShowAnswer(true);
                        }}
                        className='bg-gray-200 p-3 rounded hover:bg-gray-300'
                      >
                        {choices}
                      </button>
                    ))}
                    <div className='row-span-3'></div>
                  </div>
                  
                ) : (
                  //入力形式
                  <div className='content relative'>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="ここにイラストの名前を入力"
                      className="w-[calc(70vw)] sm:w-[calc(60vw)] md:w-[calc(50vw)] lg:w-[calc(40vw)] xl:w-[calc(30vw)] p-2 border rounded mb-4 bg-white"
                    />
                    
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full border rounded bg-white text-left mb-4 max-h-40 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              setUserAnswer(s);
                              setSuggestions([]);
                            }}
                            className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}

                    <br/>
                    <button
                      onClick={handleCheck}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      答え合わせ
                    </button>
                    <br/>
                  </div>
                )}
              </>
            ) : (
              <div className='h-[calc(100vh/2)] grid grid-rows-8 flex items-center justify-center'>
                <span className={`row-span-1 font-bold ${result === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                  {result === 'correct' ? 'せいかい！' : `ざんねん... 正解は${getFullName(current)}のイラストでした`}
                  </span>
                <button
                    onClick={handleNext}
                    className="row-span-1 mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mx-auto"
                  >
                    {currentIndex < quizList.length - 1 ? '次の問題へ' : '結果を見る'}
                  </button>
              </div>
            )}
          </div>
        </div>
      );
    }
}
