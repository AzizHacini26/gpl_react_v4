package com.gplsp.service;

import com.gplsp.entity.ClientErpT;
import com.gplsp.repository.ClientErpR;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientErpS {

    private final ClientErpR clientErpR;

    public ClientErpS(ClientErpR clientErpR) {
        this.clientErpR = clientErpR;
    }

    public List<ClientErpT> getAll() {
        return clientErpR.findAll();
    }

    public Optional<ClientErpT> getById(Integer id) {
        return clientErpR.findById(id);
    }

    public List<ClientErpT> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return clientErpR.findByNameContainingOrPhoneContaining(q, q);
    }

    public ClientErpT create(ClientErpT client) {
        return clientErpR.save(client);
    }

    public Optional<ClientErpT> update(Integer id, ClientErpT input) {
        return clientErpR.findById(id).map(existing -> {
            existing.setName(input.getName());
            existing.setPhone(input.getPhone());
            existing.setTiraz(input.getTiraz());
            existing.setTasalaly(input.getTasalaly());
            existing.setNumber(input.getNumber());
            existing.setTproduct(input.getTproduct());
            existing.setTverify(input.getTverify());
            existing.setCarnumb(input.getCarnumb());
            existing.setBattlenumb(input.getBattlenumb());
            existing.setLastTanjime(input.getLastTanjime());
            existing.setLastTanjime5(input.getLastTanjime5());
            existing.setFirsttverify(input.getFirsttverify());
            existing.setObs(input.getObs());
            existing.setSizeType(input.getSizeType());
            existing.setMcarmarqueT(input.getMcarmarqueT());
            existing.setMbatteltypeT(input.getMbatteltypeT());
            existing.setMsizeT(input.getMsizeT());
            existing.setMcartypeT(input.getMcartypeT());
            existing.setMdomicileT(input.getMdomicileT());
            existing.setMdocT(input.getMdocT());
            return clientErpR.save(existing);
        });
    }

    public boolean delete(Integer id) {
        if (clientErpR.findById(id).isEmpty()) {
            return false;
        }
        clientErpR.deleteById(id);
        return true;
    }
}
