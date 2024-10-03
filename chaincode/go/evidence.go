package main

import (
    "encoding/json"
    "fmt"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 定义证据结构体
type Evidence struct {
    EvidenceID  string `json:"evidenceID"`
    Version     int    `json:"version"`
    Timestamp   string `json:"timestamp"`
    Collector   string `json:"collector"`
    MD5Hash     string `json:"md5Hash"`
    SHA1Hash    string `json:"sha1Hash"`
    SHA256Hash  string `json:"sha256Hash"`
    SHA512Hash  string `json:"sha512Hash"`
    Description string `json:"description"`
}

type SmartContract struct {
    contractapi.Contract
}

// 保存证据，支持版本控制
func (s *SmartContract) SaveEvidence(ctx contractapi.TransactionContextInterface, evidenceID string, timestamp string, collector string, md5Hash string, sha1Hash string, sha256Hash string, sha512Hash string, description string) error {
    // 获取最新版本号
    latestVersion, err := s.getLatestVersion(ctx, evidenceID)
    if err != nil {
        return fmt.Errorf("failed to get latest version: %v", err)
    }

    newVersion := latestVersion + 1

    // 创建新的证据版本
    evidence := Evidence{
        EvidenceID:  evidenceID,
        Version:     newVersion,
        Timestamp:   timestamp,
        Collector:   collector,
        MD5Hash:     md5Hash,
        SHA1Hash:    sha1Hash,
        SHA256Hash:  sha256Hash,
        SHA512Hash:  sha512Hash,
        Description: description,
    }

    // 将版本号附加到证据ID中
    evidenceKey := fmt.Sprintf("%s_%d", evidenceID, newVersion)

    evidenceJSON, err := json.Marshal(evidence)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(evidenceKey, evidenceJSON)
}

// 查询证据，获取最新版本
func (s *SmartContract) QueryEvidence(ctx contractapi.TransactionContextInterface, evidenceID string) (*Evidence, error) {
    latestVersion, err := s.getLatestVersion(ctx, evidenceID)
    if err != nil {
        return nil, fmt.Errorf("failed to get latest version: %v", err)
    }

    evidenceKey := fmt.Sprintf("%s_%d", evidenceID, latestVersion)
    evidenceJSON, err := ctx.GetStub().GetState(evidenceKey)
    if err != nil {
        return nil, err
    }
    if evidenceJSON == nil {
        return nil, fmt.Errorf("Evidence %s does not exist", evidenceID)
    }

    var evidence Evidence
    err = json.Unmarshal(evidenceJSON, &evidence)
    if err != nil {
        return nil, err
    }

    return &evidence, nil
}

// 查询证据历史版本
func (s *SmartContract) QueryEvidenceHistory(ctx contractapi.TransactionContextInterface, evidenceID string) ([]*Evidence, error) {
    results := []*Evidence{}

    // 使用前缀扫描所有版本
    for i := 1; ; i++ {
        evidenceKey := fmt.Sprintf("%s_%d", evidenceID, i)
        evidenceJSON, err := ctx.GetStub().GetState(evidenceKey)
        if err != nil {
            return nil, err
        }
        if evidenceJSON == nil {
            break // 没有更多的版本了
        }

        var evidence Evidence
        err = json.Unmarshal(evidenceJSON, &evidence)
        if err != nil {
            return nil, err
        }

        results = append(results, &evidence)
    }

    return results, nil
}

// 查询所有证据条目
func (s *SmartContract) QueryAllEvidence(ctx contractapi.TransactionContextInterface) ([]*Evidence, error) {
    results := []*Evidence{}
    resultIterator, err := ctx.GetStub().GetStateByRange("", "")
    if err != nil {
        return nil, err
    }
    defer resultIterator.Close()

    for resultIterator.HasNext() {
        queryResult, err := resultIterator.Next()
        if err != nil {
            return nil, err
        }

        var evidence Evidence
        err = json.Unmarshal(queryResult.Value, &evidence)
        if err != nil {
            return nil, err
        }

        results = append(results, &evidence)
    }

    return results, nil
}

// 获取证据的最新版本号
func (s *SmartContract) getLatestVersion(ctx contractapi.TransactionContextInterface, evidenceID string) (int, error) {
    for i := 1; ; i++ {
        evidenceKey := fmt.Sprintf("%s_%d", evidenceID, i)
        evidenceJSON, err := ctx.GetStub().GetState(evidenceKey)
        if err != nil {
            return 0, err
        }
        if evidenceJSON == nil {
            return i - 1, nil // 返回最新的已存在版本号
        }
    }
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        fmt.Printf("Error creating evidence chaincode: %s", err.Error())
        return
    }

    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting evidence chaincode: %s", err.Error())
    }
}
