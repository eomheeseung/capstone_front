// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./token/ERC721/ERC721.sol";
import "./access/Ownable.sol";
import "./utils/Counters.sol";
import "./token/ERC721/extensions/ERC721Enumerable.sol";


contract RedNotice is ERC721,ERC721Enumerable,Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // 범죄자 정보 구조체
    struct Criminal {
        string name;
        string nationality;
        uint256 age;
        string crime;
        uint256 amount;
        bool redNoticeIssued;
        string discriptors;
        uint256 tokenId; // token ID 추가
    }

    // 범죄자 정보 매핑
    mapping(bytes32 => Criminal) public criminals;

    // token ID 별 범죄자 정보 매핑 (추가)
    mapping(uint256 => bytes32) public tokenIdToRequest;

    mapping(address => bool) allowed;

    modifier onlyAllowed() {
        require(allowed[msg.sender], "Only allowed investigative agency can call this function");
        _;
    }

    function addAllowedUser(address user) public onlyOwner {
        allowed[user] = true;
    }

    function removeAllowedUser(address user) public onlyOwner {
        allowed[user] = false;
    }
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    // 국제형사사법공조 요청서 이벤트
    event RequestReceived(
        bytes32 indexed requestId,
        string name,
        string nationality,
        uint256 age,
        string crime,
        uint256 amount
    );

    // 적색수배 발령 이벤트
    event RedNoticeIssued(bytes32 indexed requestId);

    constructor() ERC721("Red Notice", "RN") {}

    mapping(uint256 => Criminal) public _criminalInfoList;
    // 범죄자 정보 배열 (추가)
    Criminal[] public criminalList; //구조체 배열 선언

    // 국제형사사법공조 요청서 처리 함수
    function processRequest (
        string memory name,
        string memory nationality,
        uint256 age,
        string memory crime,
        uint256 amount,
        string memory discriptors
    ) public onlyAllowed returns (bytes32) {
        // 요청서 ID 생성
        bytes32 requestId = keccak256(
            abi.encodePacked(
                name,
                nationality,
                age,
                crime,
                amount,
                block.timestamp
            )
        );
        // 요청서 정보 저장
        Criminal memory newCriminal = Criminal(
            name,
            nationality,
            age,
            crime,
            amount,
            false,
            discriptors,
            0
        ); // token ID를 0으로 초기화
        criminals[requestId] = newCriminal;
        // 이벤트 발생
        emit RequestReceived(requestId, name, nationality, age, crime, amount);
        // 요청서 ID 반환
        return requestId;
    }

    function calculateFleeingRisk(
        string memory nationality,
        uint256 age,
        string memory crime,
        uint256 amount
    ) internal pure returns (uint) {
        // 국가별 도피 가능성 계수
        uint nationalRiskFactor;
        if (
            keccak256(bytes(nationality)) == keccak256(bytes("United States"))
        ) {
            nationalRiskFactor = 5;
        } else if (
            keccak256(bytes(nationality)) == keccak256(bytes("Russia"))
        ) {
            nationalRiskFactor = 10;
        } else if (keccak256(bytes(nationality)) == keccak256(bytes("China"))) {
            nationalRiskFactor = 15;
        } else {
            nationalRiskFactor = 20;
        }

        // 연령대별 도피 가능성 계수
        uint256 ageRiskFactor;
        if (age < 20) {
            ageRiskFactor = 5;
        } else if (age < 30) {
            ageRiskFactor = 10;
        } else if (age < 40) {
            ageRiskFactor = 15;
        } else {
            ageRiskFactor = 20;
        } 

        // 범죄 유형별 도피 가능성 계수
        uint256 crimeRiskFactor;
        if (keccak256(bytes(crime)) == keccak256(bytes("Money Laundering"))) {
            crimeRiskFactor = 5;
        } else if (keccak256(bytes(crime)) == keccak256(bytes("Fraud"))) {
            crimeRiskFactor = 10;
        } else if (
            keccak256(bytes(crime)) == keccak256(bytes("Drug Trafficking"))
        ) {
            crimeRiskFactor = 15;
        } else {
            crimeRiskFactor = 20;
        }

        // 돈의 양별 도피 가능성 계수
        //수백만 달러 이상이면 도피가능성이 높음
        uint256 amountRiskFactor;
        if (amount < 10000) {
            amountRiskFactor = 5;
        } else if (amount < 100000) {
            amountRiskFactor = 10;
        } else if (amount < 1000000) {
            amountRiskFactor = 15;
        } else {
            amountRiskFactor = 20;
        }

        // 전체 도피 가능성 계산
        uint256 totalRisk = nationalRiskFactor +
            ageRiskFactor +
            crimeRiskFactor +
            amountRiskFactor;
        return totalRisk;
    }

    // 적색수배 발령 함수
    function issueRedNotice(bytes32 requestId) public onlyAllowed{
        // 요청서에 해당하는 범죄자 정보 가져오기
        Criminal storage criminal = criminals[requestId];
        // 요청서가 존재하고 적색수배가 아직 발령되지 않았다면
        require(
            criminal.age > 0 && !criminal.redNoticeIssued,
            "Invalid request ID or red notice already issued"
        );

        // 해외도피 가능성 계산
        uint256 fleeingRisk = calculateFleeingRisk(
            criminal.nationality,
            criminal.age,
            criminal.crime,
            criminal.amount
        );
        // 도피 가능성이 높으면 적색수배 발령
        require(
            fleeingRisk > 20,
            "Fleeing risk is too low to issue a red notice"
        );

        // 토큰 발행 및 정보 저장
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        Criminal memory newCriminal = Criminal({
            name: criminal.name,
            nationality: criminal.nationality,
            age: criminal.age,
            crime: criminal.crime,
            amount: criminal.amount,
            redNoticeIssued: true,
            discriptors:criminal.discriptors,
            tokenId: tokenId
        }); // token ID를 0으로 초기화
        // criminals[requestId] = newCriminal;
        _criminalInfoList[tokenId] = newCriminal;
        // 토큰 생성
        _safeMint(msg.sender, tokenId);
        // 이벤트 발생
        emit RedNoticeIssued(requestId);
    }

    // 토큰 ID로 범죄자 정보 가져오기 함수
    function getCriminal(
        uint256 tokenId
    )
        public view
        returns (
            string memory,
            string memory,
            uint256,
            string memory,
            bool,
            string memory,
            uint256
        )
    {
        // tokenId를 bytes32로 변환하여 범죄자 정보 매핑에서 검색
        // bytes32 requestId = bytes32(tokenId);
        // Criminal storage criminal = criminals[requestId];
        require(
            _criminalInfoList[tokenId].tokenId == tokenId,
            "it doesn't match any criminal info"
        );

        // 검색 결과 반환
        return (
            _criminalInfoList[tokenId].name,
            _criminalInfoList[tokenId].nationality,
            _criminalInfoList[tokenId].age,
            _criminalInfoList[tokenId].crime,
            _criminalInfoList[tokenId].redNoticeIssued,
            _criminalInfoList[tokenId].discriptors,
            _criminalInfoList[tokenId].tokenId
        );
    }

    // 적색수배 철회 함수
    function withdrawRedNotice(uint tokenId) public onlyAllowed{
        // tokenId를 bytes32로 변환하여 범죄자 정보 매핑에서 검색
        // bytes32 requestId = bytes32(tokenId);
        // Criminal storage criminal = criminals[requestId];
        // 요청서가 존재하고 적색수배가 이미 발령되었다면
        require(
            _criminalInfoList[tokenId].tokenId == tokenId,
            "it doesn't match any criminal info"
        );

        // 적색수배 철회
        // criminal.redNoticeIssued = false;
        // 토큰 소멸
        _burn(tokenId);
    }
}
